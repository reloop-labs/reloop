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

/** Stable email event payload under envelope.data */
export interface EmailWebhookData {
	email_id: string;
	from: string;
	to: string[];
	subject: string | null;
	status: string;
	error?: {
		code?: number;
		message: string;
	};
}
