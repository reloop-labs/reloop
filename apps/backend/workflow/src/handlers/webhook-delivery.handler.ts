import { createHmac } from "node:crypto";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";
import { log } from "evlog";

export async function processWebhookDelivery({
	deliveryId,
	webhookId,
	webhookUrl,
	webhookSecret,
	customHeaders,
	eventId,
	eventType,
	payload,
	isLastAttempt,
}: {
	deliveryId: string;
	webhookId: string;
	webhookUrl: string;
	webhookSecret: string;
	customHeaders: Record<string, string> | null;
	eventId: string;
	eventType: string;
	payload: Record<string, unknown>;
	isLastAttempt: boolean;
}): Promise<void> {
	const timestamp = Math.floor(Date.now() / 1000);
	const body = JSON.stringify({
		id: eventId,
		event: eventType,
		payload,
		timestamp,
	});

	const signature = createHmac("sha256", webhookSecret)
		.update(`${timestamp}.${body}`)
		.digest("hex");

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"X-Reloop-Signature": signature,
		"X-Reloop-Timestamp": timestamp.toString(),
		"User-Agent": "Reloop-Webhooks/1.0",
		...(customHeaders || {}),
	};

	const startTime = Date.now();

	let response: Response;
	try {
		response = await fetch(webhookUrl, { method: "POST", headers, body });
	} catch (networkError) {
		const durationMs = Date.now() - startTime;
		const errMsg =
			networkError instanceof Error
				? networkError.message
				: String(networkError);

		log.error({
			message: "Webhook delivery network error",
			deliveryId,
			webhookId,
			error: errMsg,
		});

		await db
			.update(schema.webhookDelivery)
			.set({
				status: "failed",
				errorMessage: errMsg,
				durationMs,
				completedAt: new Date(),
				lastAttemptAt: new Date(),
			})
			.where(eq(schema.webhookDelivery.id, deliveryId));

		await db
			.update(schema.webhook)
			.set({
				failureCount: sql`${schema.webhook.failureCount} + 1`,
				consecutiveFailures: sql`${schema.webhook.consecutiveFailures} + 1`,
				lastTriggeredAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.webhook.id, webhookId));

		throw networkError; // BullMQ will retry
	}

	const durationMs = Date.now() - startTime;
	const responseText = await response.text();
	const succeeded = response.ok;

	log.info({
		message: "Webhook response received",
		deliveryId,
		status: response.status,
		succeeded,
	});

	await db
		.update(schema.webhookDelivery)
		.set({
			status: succeeded ? "success" : "failed",
			responseStatus: response.status,
			responseBody: responseText,
			responseHeaders: Object.fromEntries(response.headers.entries()),
			durationMs,
			completedAt: new Date(),
			lastAttemptAt: new Date(),
		})
		.where(eq(schema.webhookDelivery.id, deliveryId));

	await db
		.update(schema.webhook)
		.set({
			successCount: succeeded
				? sql`${schema.webhook.successCount} + 1`
				: schema.webhook.successCount,
			failureCount: !succeeded
				? sql`${schema.webhook.failureCount} + 1`
				: schema.webhook.failureCount,
			consecutiveFailures: succeeded
				? 0
				: sql`${schema.webhook.consecutiveFailures} + 1`,
			lastTriggeredAt: new Date(),
			updatedAt: new Date(),
		})
		.where(eq(schema.webhook.id, webhookId));

	if (!succeeded) {
		throw new Error(
			`Webhook endpoint returned HTTP ${response.status}: ${responseText.slice(0, 200)}`,
		);
	}
}
