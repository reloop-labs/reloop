import { cron, Patterns } from "@elysiajs/cron";
import { db } from "@reloop/db/client";
import { pendingOutboundEmail } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";
import { ensureOutboundThreadForEmailLog } from "../lib/thread-correlation";
import { proxySendToMailService } from "../routes/messages/messages.helper";

type PendingPayload = {
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
	threadId?: string;
	headers?: Record<string, string>;
	userId?: string;
};

type ClaimedPending = {
	id: string;
	organizationId: string;
	mailboxId: string;
	payload: PendingPayload;
};

/**
 * Atomically claim due rows so multiple inbox workers cannot flush the same
 * pending email (which previously created duplicate email_log rows).
 */
async function claimDuePending(limit = 50): Promise<ClaimedPending[]> {
	const result = await db.execute(sql`
		WITH due AS (
			SELECT id
			FROM pending_outbound_email
			WHERE
				(
					status = 'pending'
					AND send_at <= now()
				)
				OR (
					status = 'sending'
					AND updated_at < now() - interval '5 minutes'
				)
			ORDER BY send_at ASC
			LIMIT ${limit}
			FOR UPDATE SKIP LOCKED
		)
		UPDATE pending_outbound_email AS p
		SET
			status = 'sending',
			updated_at = now(),
			error = null
		FROM due
		WHERE p.id = due.id
		RETURNING
			p.id,
			p.organization_id AS "organizationId",
			p.mailbox_id AS "mailboxId",
			p.payload
	`);

	const rows = (result.rows ?? result) as Array<{
		id: string;
		organizationId: string;
		mailboxId: string;
		payload: PendingPayload | string;
	}>;

	return rows.map((row) => ({
		id: row.id,
		organizationId: row.organizationId,
		mailboxId: row.mailboxId,
		payload:
			typeof row.payload === "string"
				? (JSON.parse(row.payload) as PendingPayload)
				: row.payload,
	}));
}

/**
 * Flush due pending outbound emails (scheduled sends + undo window).
 * Runs every 15 seconds.
 */
export const pendingOutboundCron = cron({
	name: "pending-outbound",
	pattern: Patterns.everySenconds(15),
	async run() {
		try {
			const due = await claimDuePending(50);
			if (due.length === 0) return;

			console.log(`[Cron] Flushing ${due.length} pending outbound email(s)`);

			for (const row of due) {
				try {
					const result = (await proxySendToMailService(
						{
							mailboxId: row.mailboxId,
							organizationId: row.organizationId,
							userId: row.payload.userId,
							to: row.payload.to,
							subject: row.payload.subject,
							text: row.payload.text,
							html: row.payload.html,
							cc: row.payload.cc,
							bcc: row.payload.bcc,
							attachments: row.payload.attachments,
							threadId: row.payload.threadId,
							headers: row.payload.headers,
						},
						"",
					)) as { messageId?: string; id?: string };

					const emailLogId = typeof result.id === "string" ? result.id : null;
					if (emailLogId?.startsWith("eml_") && !row.payload.threadId) {
						try {
							await ensureOutboundThreadForEmailLog({
								emailLogId,
								organizationId: row.organizationId,
								mailboxId: row.mailboxId,
							});
						} catch (threadErr) {
							console.warn(
								`[Cron] Sent pending ${row.id} but failed to create thread:`,
								threadErr instanceof Error
									? threadErr.message
									: String(threadErr),
							);
						}
					}

					await db
						.update(pendingOutboundEmail)
						.set({
							status: "sent",
							mailMessageId: result.messageId ?? result.id ?? null,
							error: null,
						})
						.where(eq(pendingOutboundEmail.id, row.id));
				} catch (error) {
					const message =
						error instanceof Error ? error.message : String(error);
					console.error(
						`[Cron] Failed to send pending outbound ${row.id}:`,
						message,
					);
					await db
						.update(pendingOutboundEmail)
						.set({
							status: "failed",
							error: message,
						})
						.where(eq(pendingOutboundEmail.id, row.id));
				}
			}
		} catch (error) {
			console.error("[Cron] Pending outbound flush failed:", error);
		}
	},
});
