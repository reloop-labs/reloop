import type { MailModel } from "@reloop/be-mail/model/mail.model";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import { eq } from "drizzle-orm";

export async function finalizeEmail_step7({
	emailLogId,
	result,
	organizationId,
	body,
}: {
	emailLogId: string;
	result: { id: string; messageId: string };
	organizationId: string;
	body: MailModel.SendEmailBody;
}) {
	await db
		.update(emailLog)
		.set({
			messageId: result.messageId || emailLogId,
			status: "sent",
			providerMessageId: result.id,
			sentAt: new Date(),
		})
		.where(eq(emailLog.id, emailLogId));

	const recipients = Array.isArray(body.to) ? body.to : [body.to];
	const cc = body.cc ? (Array.isArray(body.cc) ? body.cc : [body.cc]) : [];
	const bcc = body.bcc ? (Array.isArray(body.bcc) ? body.bcc : [body.bcc]) : [];
	const totalRecipients = recipients.length + cc.length + bcc.length;

	await bus.publish(BusEvent.EMAIL_SENT, {
		organizationId,
		emailLogId,
		recipientCount: totalRecipients,
		timestamp: new Date().toISOString(),
	});

	return {
		success: true,
		messageId: result.messageId || emailLogId,
		status: "sent",
		timestamp: new Date().toISOString(),
	};
}
