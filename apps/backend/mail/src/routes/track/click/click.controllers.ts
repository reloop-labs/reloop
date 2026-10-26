import {
	type ClickTrackingPayload,
	decodeTrackingToken,
} from "@reloop/be-mail/lib/crypto";
import {
	type EngagementContext,
	engagementContext,
	rawRequest,
} from "@reloop/be-mail/lib/engagement-context";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { log } from "evlog";

/**
 * A person who clicked a link has read the email, even when the open pixel
 * never loaded (images blocked, text-only view, plain-text client). Record
 * that open once, at the click's time, unless a human open already exists.
 * Machine opens (Apple Mail Privacy Protection, scanners) don't count.
 */
async function inferOpenFromClick(args: {
	emailLogId: string;
	organizationId: string;
	context: EngagementContext;
	raw: ReturnType<typeof rawRequest>;
}): Promise<void> {
	const humanOpen = await db.query.emailEvent.findFirst({
		where: and(
			eq(emailEvent.emailLogId, args.emailLogId),
			eq(emailEvent.type, "opened"),
			sql`coalesce((${emailEvent.metadata}->>'machine')::boolean, false) = false`,
		),
		columns: { id: true },
	});
	if (humanOpen) return;

	const [opened] = await db
		.insert(emailEvent)
		.values({
			emailLogId: args.emailLogId,
			type: "opened",
			...args.raw,
			// The click shows the reader's browser, not their email client.
			metadata: { ...args.context, client: null, inferred: "click" },
		})
		.returning({ id: emailEvent.id });
	if (!opened) return;

	log.info({
		emailLogId: args.emailLogId,
		message: "Email open inferred from click",
	});
	await bus
		.publish(BusEvent.EMAIL_OPENED, {
			organizationId: args.organizationId,
			emailLogId: args.emailLogId,
			emailEventId: opened.id,
			timestamp: new Date().toISOString(),
		})
		.catch((err) => {
			log.error({
				message: "Failed to publish inferred EMAIL_OPENED bus event",
				emailLogId: args.emailLogId,
				error: err instanceof Error ? err.message : String(err),
			});
		});
}

export async function handleClickTracking({
	token,
	headers,
	socketIp,
}: {
	token: string;
	headers: Headers;
	socketIp: string | null;
}) {
	const payload = decodeTrackingToken<ClickTrackingPayload>(
		token,
		mailConfig.TRACKING_SECRET,
	);

	const url = payload?.url;
	const isTracked = payload?.nt !== 1;

	if (!url) {
		log.warn({
			...{ token },
			message: "Click tracking rejected: Invalid or tampered token",
		});
		throw MailErrors.invalidTrackingSignature();
	}

	if (isTracked && payload) {
		const { id: emailLogId } = payload;

		try {
			const logEntry = await db.query.emailLog.findFirst({
				where: eq(emailLog.id, emailLogId),
			});

			if (!logEntry) {
				log.warn({
					...{ emailLogId, url },
					message: "Click tracking failed: Email log not found",
				});
				throw MailErrors.invalidTrackingSignature();
			}

			const context = await engagementContext({
				kind: "click",
				headers,
				socketIp,
			});
			const raw = rawRequest(headers, socketIp);

			const [inserted] = await db
				.insert(emailEvent)
				.values({
					emailLogId,
					type: "clicked",
					...raw,
					metadata: { url, ...context },
				})
				.returning({ id: emailEvent.id });

			log.info({ ...{ emailLogId, url }, message: "Email click tracked" });

			// Opened before clicked, so automations waiting on an open see it first.
			if (!context.machine && logEntry.organizationId) {
				await inferOpenFromClick({
					emailLogId,
					organizationId: logEntry.organizationId,
					context,
					raw,
				});
			}

			if (inserted && logEntry.organizationId) {
				await bus
					.publish(BusEvent.EMAIL_CLICKED, {
						organizationId: logEntry.organizationId,
						emailLogId,
						emailEventId: inserted.id,
						url,
						timestamp: new Date().toISOString(),
					})
					.catch((err) => {
						log.error({
							message: "Failed to publish EMAIL_CLICKED bus event",
							emailLogId,
							error: err instanceof Error ? err.message : String(err),
						});
					});
			}
		} catch (error) {
			// Re-throw if it's already a structured error
			if (error && typeof error === "object" && "status" in error) {
				throw error;
			}

			log.error({
				...{
					error: error instanceof Error ? error.message : "Unknown error",
					emailLogId,
					url,
				},
				message: "Failed to track email click",
			});
		}
	}

	return Response.redirect(url, 302);
}
