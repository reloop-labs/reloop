import type {
	ApiKeyWebhookData,
	ContactGroupWebhookData,
	ContactWebhookData,
	DomainWebhookData,
	EmailWebhookData,
	InboundEmailWebhookData,
} from "./types";

/** Build canonical outbound email webhook data (snake_case public contract). */
export function buildEmailWebhookData(input: {
	emailId: string;
	from: string;
	to: string[];
	subject: string | null;
	status: string;
	error?: EmailWebhookData["error"];
	url?: string;
}): EmailWebhookData {
	const data: EmailWebhookData = {
		email_id: input.emailId,
		from: input.from,
		to: input.to,
		subject: input.subject,
		status: input.status,
	};
	if (input.error) data.error = input.error;
	if (input.url !== undefined) data.url = input.url;
	return data;
}

/** Build canonical inbound email.received data. */
export function buildInboundEmailWebhookData(input: {
	emailId: string;
	mailboxId: string;
	from: string;
	fromName?: string | null;
	to: string[];
	cc?: string[];
	subject: string;
	threadId?: string | null;
	hasAttachments?: boolean;
	isSpam?: boolean;
	messageId?: string | null;
}): InboundEmailWebhookData {
	return {
		email_id: input.emailId,
		mailbox_id: input.mailboxId,
		from: input.from,
		from_name: input.fromName ?? null,
		to: input.to,
		cc: input.cc ?? [],
		subject: input.subject,
		thread_id: input.threadId ?? null,
		has_attachments: input.hasAttachments ?? false,
		is_spam: input.isSpam ?? false,
		status: "received",
		message_id: input.messageId ?? null,
	};
}

/** Build canonical domain webhook data. */
export function buildDomainWebhookData(input: {
	id: string;
	name: string;
	status?: string | null;
}): DomainWebhookData {
	const data: DomainWebhookData = {
		id: input.id,
		name: input.name,
	};
	if (input.status !== undefined) data.status = input.status;
	return data;
}

/** Build canonical contact webhook data. */
export function buildContactWebhookData(input: {
	id: string;
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	status: string;
	source?: string;
	deliverability?: string;
}): ContactWebhookData {
	const data: ContactWebhookData = {
		id: input.id,
		email: input.email,
		first_name: input.firstName ?? null,
		last_name: input.lastName ?? null,
		status: input.status,
	};
	if (input.source !== undefined) data.source = input.source;
	if (input.deliverability !== undefined) {
		data.deliverability = input.deliverability;
	}
	return data;
}

/** Build canonical contact group webhook data. */
export function buildContactGroupWebhookData(input: {
	id: string;
	name: string;
}): ContactGroupWebhookData {
	return {
		id: input.id,
		name: input.name,
	};
}

/** Build canonical API key webhook data. */
export function buildApiKeyWebhookData(input: {
	apiKeyId: string;
	status?: string;
	action?: string;
}): ApiKeyWebhookData {
	const data: ApiKeyWebhookData = {
		api_key_id: input.apiKeyId,
	};
	if (input.status !== undefined) data.status = input.status;
	if (input.action !== undefined) data.action = input.action;
	return data;
}

/**
 * Canonical emailLog.status for Kumo-driven lifecycle webhooks.
 * Avoids racing the independent logs-service status updater.
 */
export function statusForEmailWebhookType(type: string): string | undefined {
	switch (type) {
		case "email.sent":
			return "sent";
		case "email.delivered":
			return "delivered";
		case "email.bounced":
			return "bounced";
		case "email.complained":
			return "spam";
		case "email.failed":
			return "failed";
		case "email.delivery_delayed":
			return "sent";
		case "email.received":
			return "received";
		case "email.scheduled":
			return "scheduled";
		default:
			return undefined;
	}
}
