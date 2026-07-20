import { createHmac } from "node:crypto";
import dns from "node:dns";
import net from "node:net";
import {
	createWorkflowError,
	failJobOrRetry,
	logJob,
	type WorkflowJob,
} from "@be/workflow/queues/workflow-job";
import { decryptSecret } from "@reloop/db";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";
import { EvlogError, log } from "evlog";

const WEBHOOK_ENDPOINT_FIX =
	"Check that your webhook endpoint is reachable, returns a 2xx status, and accepts the Reloop signature headers.";

const WEBHOOK_SSRF_FIX =
	"Use a publicly reachable HTTPS endpoint. Private, loopback, and link-local addresses are blocked.";

function isPrivateIP(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const parts = ip.split(".").map(Number);
		if (parts.length !== 4) return true;

		// Loopback: 127.0.0.0/8
		if (parts[0] === 127) return true;

		// Private Class A: 10.0.0.0/8
		if (parts[0] === 10) return true;

		// Private Class B: 172.16.0.0/12 (172.16.x.x - 172.31.x.x)
		if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;

		// Private Class C: 192.168.0.0/16
		if (parts[0] === 192 && parts[1] === 168) return true;

		// Link-local: 169.254.0.0/16
		if (parts[0] === 169 && parts[1] === 254) return true;

		// Unspecified/Broadcast/Multicast
		if (parts[0] === 0 || parts[0] >= 224) return true;

		return false;
	}

	if (net.isIPv6(ip)) {
		const normalized = ip.toLowerCase();
		if (normalized === "::1" || normalized === "::") return true;
		if (
			normalized.startsWith("fe8") ||
			normalized.startsWith("fe9") ||
			normalized.startsWith("fea") ||
			normalized.startsWith("feb")
		) {
			return true;
		}
		if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
			return true;
		}
		return false;
	}

	return true;
}

export async function processWebhookDelivery({
	job,
	deliveryId,
	webhookId,
	webhookUrl,
	webhookSecret,
	customHeaders,
	eventId,
	eventType,
	payload,
	isLastAttempt,
	attemptNumber,
}: {
	job: WorkflowJob;
	deliveryId: string;
	webhookId: string;
	webhookUrl: string;
	webhookSecret: string;
	customHeaders: Record<string, string> | null;
	eventId: string;
	eventType: string;
	payload: Record<string, unknown>;
	isLastAttempt: boolean;
	attemptNumber: number;
}): Promise<void> {
	await logJob(
		job,
		`Starting webhook delivery (attempt ${attemptNumber}, event=${eventType})`,
	);

	const timestamp = Math.floor(Date.now() / 1000);
	const body = JSON.stringify({
		id: eventId,
		event: eventType,
		payload,
		timestamp,
	});

	// Decrypt the stored secret
	const decryptedSecret = decryptSecret(webhookSecret);

	const signature = createHmac("sha256", decryptedSecret)
		.update(`${timestamp}.${body}`)
		.digest("hex");

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"X-Webhook-Signature": `t=${timestamp},v1=${signature}`,
		"X-Webhook-Timestamp": timestamp.toString(),
		"User-Agent": "Reloop-Webhooks/1.0",
		...(customHeaders || {}),
	};

	const startTime = Date.now();

	let response: Response;
	try {
		// SSRF Guard
		const parsedUrl = new URL(webhookUrl);
		let ips: string[] = [];
		if (net.isIP(parsedUrl.hostname)) {
			ips = [parsedUrl.hostname];
		} else {
			const lookupResults = await dns.promises.lookup(parsedUrl.hostname, {
				all: true,
			});
			ips = lookupResults.map((r) => r.address);
		}

		for (const ip of ips) {
			if (isPrivateIP(ip)) {
				throw createWorkflowError({
					status: 403,
					message: "Webhook delivery blocked",
					why: `Outbound request to private/local IP address ${ip} is blocked`,
					fix: WEBHOOK_SSRF_FIX,
				});
			}
		}

		response = await fetch(webhookUrl, { method: "POST", headers, body });
	} catch (networkError) {
		const durationMs = Date.now() - startTime;
		const errMsg =
			networkError instanceof Error
				? networkError.message
				: String(networkError);
		const why =
			networkError instanceof EvlogError && networkError.why
				? networkError.why
				: errMsg;
		const fix =
			networkError instanceof EvlogError && networkError.fix
				? networkError.fix
				: WEBHOOK_ENDPOINT_FIX;

		log.error({
			message: "Webhook delivery network error",
			deliveryId,
			webhookId,
			error: errMsg,
			why,
			fix,
		});

		const status = isLastAttempt ? "failed" : "retrying";

		await db
			.update(schema.webhookDelivery)
			.set({
				status,
				attemptNumber,
				errorMessage: errMsg,
				durationMs,
				completedAt: new Date(),
				lastAttemptAt: new Date(),
			})
			.where(eq(schema.webhookDelivery.id, deliveryId));

		// Insert attempt record
		await db.insert(schema.webhookDeliveryAttempt).values({
			webhookDeliveryId: deliveryId,
			attemptNumber,
			status: "failed",
			durationMs,
			errorMessage: errMsg,
			createdAt: new Date(),
		});

		const updatedWebhookResult = await db
			.update(schema.webhook)
			.set({
				failureCount: sql`${schema.webhook.failureCount} + 1`,
				consecutiveFailures: sql`${schema.webhook.consecutiveFailures} + 1`,
				lastTriggeredAt: new Date(),
				updatedAt: new Date(),
			})
			.where(eq(schema.webhook.id, webhookId))
			.returning({ consecutiveFailures: schema.webhook.consecutiveFailures });

		const currentConsecutiveFailures =
			updatedWebhookResult[0]?.consecutiveFailures ?? 0;
		if (currentConsecutiveFailures >= 10) {
			log.warn({
				message: "Webhook disabled due to consecutive failures exceeding limit",
				webhookId,
				consecutiveFailures: currentConsecutiveFailures,
			});
			await logJob(
				job,
				`Webhook disabled after ${currentConsecutiveFailures} consecutive failures`,
			);
			await db
				.update(schema.webhook)
				.set({
					status: "failed",
					updatedAt: new Date(),
				})
				.where(eq(schema.webhook.id, webhookId));
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

	const durationMs = Date.now() - startTime;
	const responseText = await response.text();
	const succeeded = response.ok;

	log.info({
		message: "Webhook response received",
		deliveryId,
		status: response.status,
		succeeded,
	});
	await logJob(job, `Webhook response received: HTTP ${response.status}`);

	const status = succeeded ? "success" : isLastAttempt ? "failed" : "retrying";

	await db
		.update(schema.webhookDelivery)
		.set({
			status,
			attemptNumber,
			responseStatus: response.status,
			responseBody: responseText,
			responseHeaders: Object.fromEntries(response.headers.entries()),
			durationMs,
			completedAt: new Date(),
			lastAttemptAt: new Date(),
		})
		.where(eq(schema.webhookDelivery.id, deliveryId));

	// Insert attempt record
	await db.insert(schema.webhookDeliveryAttempt).values({
		webhookDeliveryId: deliveryId,
		attemptNumber,
		status: succeeded ? "success" : "failed",
		responseStatus: response.status,
		responseBody: responseText,
		responseHeaders: Object.fromEntries(response.headers.entries()),
		durationMs,
		errorMessage: succeeded
			? null
			: `HTTP ${response.status}: ${responseText.slice(0, 200)}`,
		createdAt: new Date(),
	});

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

	const currentConsecutiveFailures =
		updatedWebhookResult[0]?.consecutiveFailures ?? 0;
	if (currentConsecutiveFailures >= 10) {
		log.warn({
			message: "Webhook disabled due to consecutive failures exceeding limit",
			webhookId,
			consecutiveFailures: currentConsecutiveFailures,
		});
		await logJob(
			job,
			`Webhook disabled after ${currentConsecutiveFailures} consecutive failures`,
		);
		await db
			.update(schema.webhook)
			.set({
				status: "failed",
				updatedAt: new Date(),
			})
			.where(eq(schema.webhook.id, webhookId));
	}

	if (succeeded) {
		await logJob(job, "Webhook delivered successfully");
		return;
	}

	await failJobOrRetry({
		job,
		isLastAttempt,
		message: "Webhook delivery failed",
		why: `Webhook endpoint returned HTTP ${response.status}: ${responseText.slice(0, 200)}`,
		fix: WEBHOOK_ENDPOINT_FIX,
		status: 502,
	});
}
