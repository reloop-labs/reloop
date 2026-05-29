import {
	type ClickTrackingPayload,
	decodeTrackingToken,
} from "@reloop/be-mail/lib/crypto";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import { mailConfig } from "@reloop/be-mail/mail.config";
import { db } from "@reloop/db/client";
import { emailEvent, emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export async function handleClickTracking({ token }: { token: string }) {
	const payload = decodeTrackingToken<ClickTrackingPayload>(
		token,
		mailConfig.TRACKING_SECRET,
	);

	let isTracked = true;
	let url = payload?.url;

	if (!payload) {
		// Fallback: decode without signature verification (untracked redirect when clickTracking is disabled)
		try {
			const json = Buffer.from(token, "base64url").toString("utf-8");
			const obj = JSON.parse(json) as { url?: string };
			if (obj.url) {
				url = obj.url;
				isTracked = false;
			}
		} catch {}
	}

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

			await db.insert(emailEvent).values({
				emailLogId,
				type: "clicked",
				metadata: {
					url,
				},
			});
			log.info({ ...{ emailLogId, url }, message: "Email click tracked" });
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
