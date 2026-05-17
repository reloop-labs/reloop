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

// API Key Service Types
export interface ApiKey {
	id: string;
	key?: string;
	name: string;
	userId?: string;
	organizationId: string;
	enabled: boolean;
	rateLimitEnabled: boolean;
	rateLimit?: {
		max: number;
		windowSeconds: number;
	};
	createdAt: string;
	updatedAt: string;
	lastUsedAt?: string;
}

export interface CreateApiKeyRequest {
	name: string;
	enabled?: boolean;
	rateLimitEnabled?: boolean;
}

export interface UpdateApiKeyRequest {
	name?: string;
	enabled?: boolean;
	rateLimitEnabled?: boolean;
}

export interface ListApiKeysQuery {
	limit?: number;
	offset?: number;
	search?: string;
}

export interface ListApiKeysResponse {
	keys: ApiKey[];
	total: number;
	hasMore: boolean;
}
