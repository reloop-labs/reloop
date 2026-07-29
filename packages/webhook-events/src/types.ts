export interface WebhookEventDefinition {
	id: string;
	name: string;
	category: string;
	description: string;
	/** When false, event is hidden from create/update subscription UI and API validation. */
	isActive: boolean;
}

/** Canonical outbound webhook envelope (clean-break public contract). */
export interface WebhookEnvelope<TData = Record<string, unknown>> {
	id: string;
	type: string;
	created_at: string;
	data: TData;
}

/** Outbound email lifecycle payload under envelope.data (snake_case). */
export interface EmailWebhookData {
	email_id: string;
	from: string;
	to: string[];
	subject: string | null;
	status: string;
	/** Present on bounce, delay, complaint, and failure events. */
	error?: {
		code?: number;
		message: string;
	};
	/** Present on email.clicked. */
	url?: string;
	/** Present on email.scheduled (ISO 8601). */
	scheduled_at?: string;
}

/** Inbound receive payload under envelope.data. */
export interface InboundEmailWebhookData {
	email_id: string;
	mailbox_id: string;
	from: string;
	from_name: string | null;
	to: string[];
	cc: string[];
	subject: string;
	thread_id: string | null;
	has_attachments: boolean;
	is_spam: boolean;
	status: "received";
	message_id: string | null;
}

/** Domain lifecycle payload under envelope.data. */
export interface DomainWebhookData {
	id: string;
	name: string;
	/** Domain status when known (e.g. pending, active, failed). */
	status?: string | null;
}

/** Contact lifecycle payload under envelope.data. */
export interface ContactWebhookData {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
	status: string;
	/** Optional provenance for auto-created contacts. */
	source?: string;
	deliverability?: string;
}

/** Contact group lifecycle payload under envelope.data. */
export interface ContactGroupWebhookData {
	id: string;
	name: string;
}

/** API key lifecycle payload under envelope.data. */
export interface ApiKeyWebhookData {
	api_key_id: string;
	status?: string;
	action?: string;
}
