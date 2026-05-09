import { kumomtaClient } from "@reloop/be-mailing/lib/kumomta-client";
import type { MailModel } from "@reloop/be-mailing/model/mail.model";


export async function sendEmail_step6({
	body,
	finalSubject,
	finalHtml,
	finalText,
	organizationId,
	domainId,
	emailLogId,
}: {
	body: MailModel.SendEmailBody;
	finalSubject: string;
	finalHtml?: string;
	finalText?: string;
	organizationId: string;
	domainId: string;
	emailLogId: string;
}) {
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
		customHeaders: {
			"X-Org-ID": organizationId,
			"X-Domain-ID": domainId,
			"X-Email-Log-ID": emailLogId,
			...(body.headers || {}),
		},
	});
}
