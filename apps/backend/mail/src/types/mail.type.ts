import type { MailModel } from "@reloop/be-mail/model/mail.model.js";

export namespace MailTypes {
	export type SendEmailBody = typeof MailModel.sendEmailBody.static;
	export type SendEmailResponse = typeof MailModel.sendEmailResponse.static;
	export type GetAttachmentParams = typeof MailModel.getAttachmentParams.static;
	export type GetAttachmentResponse =
		typeof MailModel.getAttachmentResponse.static;
	export type Unauthorized = typeof MailModel.unauthorized.static;
	export type Forbidden = typeof MailModel.forbidden.static;
	export type BadRequest = typeof MailModel.badRequest.static;
	export type InternalServerError = typeof MailModel.internalServerError.static;
	export type DomainNotFound = typeof MailModel.domainNotFound.static;
	export type MailboxNotFound = typeof MailModel.mailboxNotFound.static;

	// Internal interfaces for controller use
	export interface SendEmailRequest {
		from: string;
		to: string | string[];
		subject: string;
		text?: string;
		html?: string;
		reply_to?: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
		scheduled_at?: string;
		headers?: Record<string, string>;
		channel_id?: string;
		attachments?: Array<{
			content?: string | Buffer | import("stream").Readable;
			filename?: string;
			path?: string;
			content_type?: string;
			content_id?: string;
		}>;
		tags?: Array<{ name: string; value: string }>;
		template?: {
			id: string;
			/**
			 * Variables to replace in the template.
			 * Key: ASCII letters, numbers, underscores. Max 50 chars. Not reserved.
			 * Value: string (max 2000 chars) or number (max 2^53 - 1).
			 */
			variables?: Record<string, string | number>;
		};
	}

	export interface SendEmailHandlerResponse {
		success: boolean;
		messageId: string;
		status: string;
		timestamp: string;
		id: string;
	}
}
