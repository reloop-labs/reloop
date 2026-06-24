import { kumomtaClient } from "@reloop/be-mail/lib/kumomta-client";
import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";

export async function sendEmail_step6({
	body,
	finalSubject,
	finalHtml,
	finalText,
	organizationId,
	domainId,
	emailLogId,
	apiKey,
}: {
	body: MailModel.SendEmailBody;
	finalSubject: string;
	finalHtml?: string;
	finalText?: string;
	organizationId: string;
	domainId: string;
	emailLogId: string;
	apiKey: string;
}) {
	try {
		return await kumomtaClient.sendEmail({
			from: body.from,
			to: body.to,
			subject: finalSubject,
			text: finalText,
			html: finalHtml,
			reply_to: body.reply_to,
			cc: body.cc,
			bcc: body.bcc,
			scheduled_at: body.scheduled_at,
			channel_id: body.channel_id,
			tags: body.tags,
			template: body.template,
			attachments: body.attachments?.map((att) => ({
				filename: att.filename,
				content: typeof att.content === "string" ? att.content : undefined,
				path: att.path,
				content_type: att.content_type,
				content_id: att.content_id,
			})),
			apiKey,
			customHeaders: {
				"X-Org-ID": organizationId,
				"X-Domain-ID": domainId,
				"X-Email-Log-ID": emailLogId,
				"X-Api-Key": apiKey,
				...(body.headers || {}),
			},
		});
	} catch (error) {
		// Mark the log record as failed before re-throwing so it is never
		// stuck permanently in "pending" status.
		await db
			.update(emailLog)
			.set({
				status: "failed",
				errorMessage: error instanceof Error ? error.message : String(error),
				failedAt: new Date(),
			})
			.where(eq(emailLog.id, emailLogId))
			// Swallow the DB error so the original send error always propagates.
			.catch(() => {});
		throw error;
	}
}
