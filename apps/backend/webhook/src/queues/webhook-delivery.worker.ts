import { createHmac } from "node:crypto";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { webhookConfig } from "@reloop/webhook/webhook.config";
import { Worker } from "bullmq";
import { eq, sql } from "drizzle-orm";
import {
	WEBHOOK_DELIVERY_QUEUE,
	type WebhookDeliveryJobData,
} from "./webhook-delivery.queue";

const connection = {
	url: webhookConfig.REDIS_URL,
};

async function dispatchWebhook(job: WebhookDeliveryJobData): Promise<void> {
	const {
		deliveryId,
		webhookId,
		webhookUrl,
		webhookSecret,
		customHeaders,
		eventId,
		eventType,
		payload,
	} = job;

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
		// Network-level failure — mark delivery failed and re-throw so BullMQ retries
		const durationMs = Date.now() - startTime;
		const errMsg =
			networkError instanceof Error
				? networkError.message
				: String(networkError);

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
		// Non-2xx response — throw so BullMQ retries
		throw new Error(
			`Webhook endpoint returned HTTP ${response.status}: ${responseText.slice(0, 200)}`,
		);
	}
}

export function startWebhookDeliveryWorker(): Worker {
	const worker = new Worker<WebhookDeliveryJobData>(
		WEBHOOK_DELIVERY_QUEUE,
		async (job) => {
			logger.info(
				{
					jobId: job.id,
					deliveryId: job.data.deliveryId,
					attempt: job.attemptsMade + 1,
				},
				"Processing webhook delivery job",
			);
			await dispatchWebhook(job.data);
		},
		{
			connection,
			concurrency: 20,
		},
	);

	worker.on("completed", (job) => {
		logger.info(
			{ jobId: job.id, deliveryId: job.data.deliveryId },
			"Webhook delivery job completed",
		);
	});

	worker.on("failed", (job, err) => {
		logger.error(
			{
				jobId: job?.id,
				deliveryId: job?.data.deliveryId,
				webhookId: job?.data.webhookId,
				attempt: (job?.attemptsMade ?? 0) + 1,
				error: err.message,
			},
			"Webhook delivery job failed",
		);
	});

	worker.on("error", (err) => {
		logger.error({ error: err.message }, "Webhook delivery worker error");
	});

	logger.info("Webhook delivery worker started");
	return worker;
}
