import type { WebhookEnvelope } from "@reloop/webhook-events";

export function buildWebhookEnvelope(input: {
	id: string;
	type: string;
	createdAt?: Date | string;
	data: Record<string, unknown>;
}): WebhookEnvelope {
	const created =
		input.createdAt instanceof Date
			? input.createdAt
			: input.createdAt
				? new Date(input.createdAt)
				: new Date();

	return {
		id: input.id,
		type: input.type,
		created_at: created.toISOString(),
		data: input.data,
	};
}

/** Serialize envelope to the exact JSON body string used for signing and POST. */
export function serializeWebhookEnvelope(envelope: WebhookEnvelope): string {
	return JSON.stringify(envelope);
}
