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
	},
	apiKey: string,
	cookie?: string,
) {
	const log = useLogger();
	log.info(`[INBOX] Sending new message from mailbox ${body.mailboxId}`);

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
