/**
 * Type definitions for Reloop SDK
 */

export interface Attachment {
	content?: string | unknown;
	filename?: string;
	path?: string;
	contentType?: string;
	contentId?: string;
}

export interface Tag {
	name: string;
	value: string;
}

export interface TemplateOptions {
	id: string;
	variables?: Record<string, string | number>;
}

// Mail Service Types
export interface SendEmailRequest {
	from: string;
	to: string | string[];
	subject: string;
	text?: string;
	html?: string;
	replyTo?: string | string[];
	cc?: string | string[];
	bcc?: string | string[];
	scheduledAt?: string;
	headers?: Record<string, string>;
	channelId?: string;
	attachments?: Attachment[];
	tags?: Tag[];
	template?: TemplateOptions;
}

export interface SendEmailResponse {
	success: boolean;
	messageId: string;
	status: string;
	timestamp: string;
}
