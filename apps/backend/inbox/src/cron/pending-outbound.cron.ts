import { cron, Patterns } from "@elysiajs/cron";
import { db } from "@reloop/db/client";
import { pendingOutboundEmail } from "@reloop/db/schema";
import { and, eq, lte } from "drizzle-orm";
import { proxySendToMailService } from "../routes/messages/messages.helper";

/**
 * Flush due pending outbound emails (scheduled sends + undo window).
 * Runs every 15 seconds.
 */
export const pendingOutboundCron = cron({
	name: "pending-outbound",
	pattern: Patterns.everySenconds(15),
	async run() {
		try {
			const now = new Date();
			const due = await db.query.pendingOutboundEmail.findMany({
				where: and(
					eq(pendingOutboundEmail.status, "pending"),
					lte(pendingOutboundEmail.sendAt, now),
				),
				limit: 50,
			});

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
