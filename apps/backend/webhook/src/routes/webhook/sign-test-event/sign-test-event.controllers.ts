import { createId } from "@paralleldrive/cuid2";
import { decryptSecret } from "@reloop/db";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { WebhookErrors } from "@reloop/webhook/error/webhook.error-response";
import {
	buildDeliveryHeaders,
	buildWebhookEnvelope,
	serializeWebhookEnvelope,
	signWebhookBody,
} from "@reloop/webhook-delivery";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
import type { WebhookTypes } from "../webhook.type";

export async function signTestEventController({
	webhookId,
	event,
	payload,
	organizationId,
}: {
	webhookId: string;
	event: string;
	payload: Record<string, unknown>;
	organizationId: string;
}): Promise<WebhookTypes.SignTestEventResponse> {
	log.info({
		webhookId,
		event,
		organizationId,
		message: "Signing test webhook event",
	});

	const webhook = await db.query.webhook.findFirst({
		where: and(
			eq(schema.webhook.id, webhookId),
			eq(schema.webhook.organizationId, organizationId),
			isNull(schema.webhook.deletedAt),
		),
	});

	if (!webhook) {
		throw WebhookErrors.notFound(webhookId);
	}

	const eventId = `whev_test_${createId()}`;
	const envelope = buildWebhookEnvelope({
		id: eventId,
		type: event,
		createdAt: new Date().toISOString(),
		data: payload,
	});

	const rawBody = serializeWebhookEnvelope(envelope);
	const timestampSeconds = Math.floor(Date.now() / 1000);
	const secret = decryptSecret(webhook.secret);
	const signatureHex = signWebhookBody(secret, rawBody, timestampSeconds);
	const headers = buildDeliveryHeaders({
		eventId,
		timestampSeconds,
		signatureHex,
		customHeaders: webhook.customHeaders as Record<string, string> | null,
	});

	return {
		url: webhook.url,
		headers,
		body: envelope as unknown as Record<string, unknown>,
		rawBody,
	};
}
