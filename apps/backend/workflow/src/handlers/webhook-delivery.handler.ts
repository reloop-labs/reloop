import {
	createWorkflowError,
	failJobOrRetry,
	logJob,
	type WorkflowJob,
} from "@be/workflow/queues/workflow-job";
import { decryptSecret } from "@reloop/db";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import {
	buildDeliveryHeaders,
	buildWebhookEnvelope,
	getWebhookRetryDelayMs,
	postWebhook,
	serializeWebhookEnvelope,
	signWebhookBody,
	WEBHOOK_DISABLE_AFTER_CONSECUTIVE_FAILURES,
	WEBHOOK_RESPONSE_BODY_MAX_CHARS,
	type WebhookHttpError,
} from "@reloop/webhook-delivery";
import { eq, sql } from "drizzle-orm";
import { log } from "evlog";

const WEBHOOK_ENDPOINT_FIX =
	"Check that your webhook endpoint is reachable, returns a 2xx status, and accepts the Reloop signature headers.";

const WEBHOOK_SSRF_FIX =
	"Use a publicly reachable HTTPS endpoint. Private, loopback, and link-local addresses are blocked.";

function truncateBody(body: string): string {
	if (body.length <= WEBHOOK_RESPONSE_BODY_MAX_CHARS) return body;
	return `${body.slice(0, WEBHOOK_RESPONSE_BODY_MAX_CHARS)}…[truncated]`;
}

function isHttpError(err: unknown): err is Error & WebhookHttpError {
	if (!(err instanceof Error) || !("kind" in err)) return false;
	const kind = (err as { kind?: unknown }).kind;
	return kind === "ssrf" || kind === "network" || kind === "timeout";
}

export async function processWebhookDelivery({
	job,
	deliveryId,
	isLastAttempt,
	attemptNumber,
}: {
	job: WorkflowJob;
	deliveryId: string;
	isLastAttempt: boolean;
	attemptNumber: number;
}): Promise<void> {
	await logJob(
		job,
		`Starting webhook delivery (attempt ${attemptNumber}, deliveryId=${deliveryId})`,
	);

	const delivery = await db.query.webhookDelivery.findFirst({
		where: eq(schema.webhookDelivery.id, deliveryId),
		with: {
			webhook: true,
			event: true,
		},
	});

	if (!delivery) {
		await logJob(job, `Delivery ${deliveryId} not found — skipping`);
		return;
	}

	const webhook = delivery.webhook;
	if (!webhook || webhook.deletedAt) {
		await db
			.update(schema.webhookDelivery)
			.set({
				status: "failed",
				errorMessage: "Webhook endpoint was deleted",
				completedAt: new Date(),
				attemptNumber,
				lastAttemptAt: new Date(),
			})
			.where(eq(schema.webhookDelivery.id, deliveryId));
		await logJob(job, "Webhook deleted — marking delivery failed");
		return;
	}

	if (webhook.status !== "active") {
		await db
			.update(schema.webhookDelivery)
			.set({
				status: "failed",
				errorMessage: `Webhook is ${webhook.status}`,
				completedAt: new Date(),
				attemptNumber,
				lastAttemptAt: new Date(),
			})
			.where(eq(schema.webhookDelivery.id, deliveryId));
		await logJob(job, `Webhook status=${webhook.status} — not delivering`);
		return;
	}

	const eventId = delivery.webhookEventId ?? delivery.id;
	const eventType = delivery.eventType;
	const eventData = delivery.eventData as Record<string, unknown>;
	const createdAt = delivery.event?.createdAt ?? delivery.createdAt;

	const envelope = buildWebhookEnvelope({
		id: eventId,
		type: eventType,
		createdAt,
		data: eventData,
	});
	const rawBody = serializeWebhookEnvelope(envelope);
	const timestamp = Math.floor(Date.now() / 1000);
	const secret = decryptSecret(webhook.secret);
	const signatureHex = signWebhookBody(secret, rawBody, timestamp);
	const headers = buildDeliveryHeaders({
		eventId,
		timestampSeconds: timestamp,
		signatureHex,
		customHeaders: webhook.customHeaders as Record<string, string> | null,
	});

	const requestBodyJson = envelope as unknown as Record<string, unknown>;

	let result:
		| {
				ok: true;
				status: number;
				headers: Record<string, string>;
				body: string;
				durationMs: number;
		  }
		| {
				ok: false;
				error: Error & Partial<WebhookHttpError>;
				durationMs: number;
		  };

	try {
		const allowHttp = process.env.NODE_ENV === "development";
		const response = await postWebhook({
			url: webhook.url,
			headers,
			body: rawBody,
			allowHttp,
		});
		result = {
			ok: true,
			status: response.status,
			headers: response.headers,
			body: response.body,
			durationMs: response.durationMs,
		};
	} catch (err) {
		const e = err instanceof Error ? err : new Error(String(err));
		const durationMs = isHttpError(err) ? err.durationMs : 0;
		result = {
			ok: false,
			error: e as Error & Partial<WebhookHttpError>,
			durationMs,
		};
	}

	if (!result.ok) {
		const errMsg = result.error.message;
		const isSsrf = result.error.kind === "ssrf";
		const why = errMsg;
		const fix = isSsrf ? WEBHOOK_SSRF_FIX : WEBHOOK_ENDPOINT_FIX;

		log.error({
			message: "Webhook delivery network/ssrf error",
			deliveryId,
			webhookId: webhook.id,
			error: errMsg,
			kind: result.error.kind,
		});

		const status = isLastAttempt || isSsrf ? "failed" : "retrying";
		const nextRetryAt =
			status === "retrying"
				? new Date(Date.now() + getWebhookRetryDelayMs(attemptNumber))
				: null;

		await db
			.update(schema.webhookDelivery)
			.set({
				status,
				attemptNumber,
				errorMessage: errMsg,
				requestUrl: webhook.url,
				requestHeaders: headers,
				requestBody: requestBodyJson,
				durationMs: result.durationMs,
				// Only set completedAt on terminal states
				completedAt: status === "failed" ? new Date() : null,
				lastAttemptAt: new Date(),
				nextRetryAt,
			})
			.where(eq(schema.webhookDelivery.id, deliveryId));

		await db.insert(schema.webhookDeliveryAttempt).values({
			webhookDeliveryId: deliveryId,
			attemptNumber,
			status: "failed",
			durationMs: result.durationMs,
			errorMessage: errMsg,
			createdAt: new Date(),
		});

		// SSRF is non-retryable; terminal fail counters now.
		if (status === "failed") {
			await recordTerminalWebhookOutcome({
				webhookId: webhook.id,
				succeeded: false,
				job,
			});
		}

		if (isSsrf) {
			// Do not retry SSRF — permanent configuration error.
			await logJob(job, `SSRF blocked (final): ${why}`);
			return;
		}

		await failJobOrRetry({
			job,
			isLastAttempt,
			message: "Webhook delivery failed",
			why,
			fix,
			status: 502,
		});
		return;
	}

	const responseText = truncateBody(result.body);
	const succeeded = result.status >= 200 && result.status < 300;
	const status = succeeded ? "success" : isLastAttempt ? "failed" : "retrying";
	const nextRetryAt =
		status === "retrying"
			? new Date(Date.now() + getWebhookRetryDelayMs(attemptNumber))
			: null;

	log.info({
		message: "Webhook response received",
		deliveryId,
		status: result.status,
		succeeded,
	});
	await logJob(job, `Webhook response received: HTTP ${result.status}`);

	await db
		.update(schema.webhookDelivery)
		.set({
			status,
			attemptNumber,
			responseStatus: result.status,
			responseBody: responseText,
			responseHeaders: result.headers,
			requestUrl: webhook.url,
			requestHeaders: headers,
			requestBody: requestBodyJson,
			durationMs: result.durationMs,
			completedAt:
				status === "success" || status === "failed" ? new Date() : null,
			lastAttemptAt: new Date(),
			nextRetryAt,
			errorMessage: succeeded
				? null
				: `HTTP ${result.status}: ${responseText.slice(0, 200)}`,
		})
		.where(eq(schema.webhookDelivery.id, deliveryId));

	await db.insert(schema.webhookDeliveryAttempt).values({
		webhookDeliveryId: deliveryId,
		attemptNumber,
		status: succeeded ? "success" : "failed",
		responseStatus: result.status,
		responseBody: responseText,
		responseHeaders: result.headers,
		durationMs: result.durationMs,
		errorMessage: succeeded
			? null
			: `HTTP ${result.status}: ${responseText.slice(0, 200)}`,
		createdAt: new Date(),
	});

	if (succeeded || isLastAttempt) {
		await recordTerminalWebhookOutcome({
			webhookId: webhook.id,
			succeeded,
			job,
		});
	} else {
		// Intermediate failure — update lastTriggeredAt only
		await db
			.update(schema.webhook)
			.set({
				lastTriggeredAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.webhook.id, webhook.id));
	}

	if (succeeded) {
		await logJob(job, "Webhook delivered successfully");
		return;
	}

	await failJobOrRetry({
		job,
		isLastAttempt,
		message: "Webhook delivery failed",
		why: `Webhook endpoint returned HTTP ${result.status}: ${responseText.slice(0, 200)}`,
		fix: WEBHOOK_ENDPOINT_FIX,
		status: 502,
	});
}

async function recordTerminalWebhookOutcome({
	webhookId,
	succeeded,
	job,
}: {
	webhookId: string;
	succeeded: boolean;
	job: WorkflowJob;
}): Promise<void> {
	const updatedWebhookResult = await db
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
		.where(eq(schema.webhook.id, webhookId))
		.returning({ consecutiveFailures: schema.webhook.consecutiveFailures });

	const consecutive = updatedWebhookResult[0]?.consecutiveFailures ?? 0;

	if (!succeeded && consecutive >= WEBHOOK_DISABLE_AFTER_CONSECUTIVE_FAILURES) {
		log.warn({
			message: "Webhook disabled due to consecutive failures exceeding limit",
			webhookId,
			consecutiveFailures: consecutive,
		});
		await logJob(
			job,
			`Webhook disabled after ${consecutive} consecutive terminal failures`,
		);
		await db
			.update(schema.webhook)
			.set({
				status: "failed",
				updatedAt: new Date(),
			})
			.where(eq(schema.webhook.id, webhookId));
	}
}

// Re-export for tests / typing consistency
export { createWorkflowError };
