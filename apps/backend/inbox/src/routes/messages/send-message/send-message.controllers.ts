import { db } from "@reloop/db/client";
import { mailbox, pendingOutboundEmail } from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { proxySendToMailService } from "../messages.helper";

export async function sendMessageController(
	organizationId: string,
	body: {
		mailboxId: string;
		to: string | string[];
		subject: string;
		text?: string;
		html?: string;
		cc?: string | string[];
		bcc?: string | string[];
		attachments?: Array<{
			content?: string;
			filename?: string;
			path?: string;
			content_type?: string;
			content_id?: string;
		}>;
		scheduledAt?: string;
		undoWindowSeconds?: number;
	},
	apiKey: string,
	cookie?: string,
	userId?: string,
) {
	const log = useLogger();
	log.info(`[INBOX] Sending new message from mailbox ${body.mailboxId}`);

	const undoWindowSeconds =
		body.undoWindowSeconds === undefined
			? body.scheduledAt
				? 0
				: 15
			: body.undoWindowSeconds;

	const shouldDefer = Boolean(body.scheduledAt) || undoWindowSeconds > 0;

	if (shouldDefer) {
		const mbx = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.id, body.mailboxId),
				eq(mailbox.organizationId, organizationId),
			),
		});

		if (!mbx) {
			throw createError({
				status: 404,
				message: "Mailbox not found",
				why: `Mailbox ${body.mailboxId} was not found`,
				fix: "Verify the mailbox ID",
			});
		}

		const sendAt = body.scheduledAt
			? new Date(body.scheduledAt)
			: new Date(Date.now() + undoWindowSeconds * 1000);

		if (Number.isNaN(sendAt.getTime())) {
			throw createError({
				status: 400,
				message: "Invalid scheduledAt",
				why: "scheduledAt must be a valid ISO 8601 datetime",
				fix: "Provide a valid ISO timestamp",
			});
		}

		const [pending] = await db
			.insert(pendingOutboundEmail)
			.values({
				organizationId,
				mailboxId: body.mailboxId,
				status: "pending",
				sendAt,
				payload: {
					to: body.to,
					subject: body.subject,
					text: body.text,
					html: body.html,
					cc: body.cc,
					bcc: body.bcc,
					attachments: body.attachments,
					userId,
				},
			})
			.returning();

		if (!pending) {
			throw createError({
				status: 500,
				message: "Failed to queue email",
				why: "Insert returned no row",
				fix: "Retry the request",
			});
		}

		log.info(
			`[INBOX] Queued pending outbound ${pending.id} for ${sendAt.toISOString()}`,
		);

		return {
			success: true,
			pending: true,
			id: pending.id,
			sendAt: sendAt.toISOString(),
			messageId: pending.id,
		};
	}

	return proxySendToMailService(
		{
			mailboxId: body.mailboxId,
			organizationId,
			to: body.to,
			subject: body.subject,
			text: body.text,
			html: body.html,
			cc: body.cc,
			bcc: body.bcc,
			attachments: body.attachments,
		},
		apiKey,
		cookie,
	);
}
