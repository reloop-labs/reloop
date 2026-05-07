import type { MailTypes } from "@reloop/be-mailing/types/mail.type.js";

export function formatSendEmailResponse(
	data: MailTypes.SendEmailHandlerResponse,
): MailTypes.SendEmailResponse {
	return {
		success: data.success,
		messageId: data.messageId,
		status: data.status,
		timestamp: data.timestamp,
	};
}
