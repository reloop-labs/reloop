import { dispatchWebhookEvent } from "@be/workflow/lib/webhook-dispatcher";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { WEBHOOK_DISPATCHER_QUEUE_GROUP } from "@reloop/webhook-delivery";
import type { EmailWebhookData } from "@reloop/webhook-events";
import { eq } from "drizzle-orm";
import { log } from "evlog";

function emailDataFromLog(
	email: typeof schema.emailLog.$inferSelect,
	error?: EmailWebhookData["error"],
): EmailWebhookData {
	const data: EmailWebhookData = {
		email_id: email.id,
		from: email.fromEmail,
		to: email.toEmails,
		subject: email.subject ?? null,
		status: email.status,
	};
	if (error) data.error = error;
	return data;
}

export async function initWebhookSubscribers() {
	const queue = { queue: WEBHOOK_DISPATCHER_QUEUE_GROUP };

	// Manual / test triggers from be-webhook control plane
	await bus.subscribe(
		BusEvent.WEBHOOK_TRIGGERED,
		async (payload) => {
			log.info({
				message: "Received webhook.triggered (manual/test)",
				event: payload.event,
				organizationId: payload.organizationId,
			});

			if (!payload.organizationId) {
				log.warn({
					message: "webhook.triggered missing organizationId — skipped",
					event: payload.event,
				});
				return;
			}

			await dispatchWebhookEvent({
				type: payload.event,
				data: payload.payload ?? {},
				organizationId: payload.organizationId,
				source: "manual",
				userId: payload.userId,
			});
		},
		queue,
	);

	// ── Domain lifecycle (direct, no WEBHOOK_TRIGGERED hop) ──────────────
	await bus.subscribe(
		BusEvent.DOMAIN_CREATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "domain.create",
				data: {
					domainId: payload.domainId,
					domain: payload.domain,
				},
				organizationId: payload.organizationId,
				source: "domain",
				idempotencyKey: `${payload.organizationId}:domain.create:${payload.domainId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.DOMAIN_UPDATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "domain.update",
				data: {
					domainId: payload.domainId,
					domain: payload.domain,
				},
				organizationId: payload.organizationId,
				source: "domain",
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.DOMAIN_DELETED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "domain.delete",
				data: {
					domainId: payload.domainId,
					domain: payload.domain,
				},
				organizationId: payload.organizationId,
				source: "domain",
				idempotencyKey: `${payload.organizationId}:domain.delete:${payload.domainId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.DOMAIN_UNDELETED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "domain.undelete",
				data: {
					domainId: payload.domainId,
					domain: payload.domain,
				},
				organizationId: payload.organizationId,
				source: "domain",
				idempotencyKey: `${payload.organizationId}:domain.undelete:${payload.domainId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.DOMAIN_VERIFIED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "domain.verify",
				data: {
					domainId: payload.domainId,
					domain: payload.domain,
				},
				organizationId: payload.organizationId,
				source: "domain",
				idempotencyKey: `${payload.organizationId}:domain.verify:${payload.domainId}`,
			});
		},
		queue,
	);

	// ── API key lifecycle ────────────────────────────────────────────────
	await bus.subscribe(
		BusEvent.API_KEY_CREATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.create",
				data: { api_key_id: payload.api_key_id },
				organizationId: payload.organizationId,
				source: "api-key",
				idempotencyKey: `${payload.organizationId}:api-key.create:${payload.api_key_id}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.API_KEY_UPDATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.update",
				data: { api_key_id: payload.api_key_id },
				organizationId: payload.organizationId,
				source: "api-key",
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.API_KEY_DELETED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.delete",
				data: { api_key_id: payload.api_key_id },
				organizationId: payload.organizationId,
				source: "api-key",
				idempotencyKey: `${payload.organizationId}:api-key.delete:${payload.api_key_id}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.API_KEY_DISABLED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.update",
				data: { api_key_id: payload.api_key_id, status: "disabled" },
				organizationId: payload.organizationId,
				source: "api-key",
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.API_KEY_ENABLED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.update",
				data: { api_key_id: payload.api_key_id, status: "enabled" },
				organizationId: payload.organizationId,
				source: "api-key",
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.API_KEY_ROTATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.update",
				data: { api_key_id: payload.api_key_id, action: "rotated" },
				organizationId: payload.organizationId,
				source: "api-key",
			});
		},
		queue,
	);

	// ── Email lifecycle ──────────────────────────────────────────────────
	await bus.subscribe(
		BusEvent.EMAIL_SENT,
		async (payload) => {
			log.info({
				message: "Received email.sent — dispatching webhooks",
				emailLogId: payload.emailLogId,
				organizationId: payload.organizationId,
			});

			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, payload.emailLogId),
			});

			if (!email) {
				log.warn({
					message: "Email log not found for webhook dispatch",
					emailLogId: payload.emailLogId,
				});
				return;
			}

			const data = emailDataFromLog(email);
			await dispatchWebhookEvent({
				type: "email.sent",
				data: data as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "email",
				idempotencyKey: `${payload.organizationId}:email.sent:${email.id}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.KUMOMTA_EVENT,
		async (event) => {
			let webhookType: string | null = null;
			if (event.type === "Delivery") {
				webhookType = "email.delivered";
			} else if (event.type === "Bounce" || event.type === "AdminBounce") {
				webhookType = "email.bounced";
			} else if (event.type === "TransientFailure") {
				webhookType = "email.delivery_delayed";
			} else if (event.type === "Feedback") {
				webhookType = "email.complained";
			}

			if (!webhookType) return;

			let emailLogId =
				event.headers?.["X-Email-Log-ID"] || event.meta?.["X-Email-Log-ID"];

			if (!emailLogId || typeof emailLogId !== "string") {
				const logEntry = await db.query.emailLog.findFirst({
					where: eq(schema.emailLog.providerMessageId, event.id),
					columns: { id: true },
				});
				if (logEntry) emailLogId = logEntry.id;
			}

			if (!emailLogId || typeof emailLogId !== "string") return;

			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, emailLogId),
			});

			if (!email?.organizationId) return;

			log.info({
				message: `KumoMTA ${event.type} → ${webhookType}`,
				emailLogId,
				organizationId: email.organizationId,
			});

			let error: EmailWebhookData["error"] | undefined;
			if (
				webhookType === "email.bounced" ||
				webhookType === "email.complained" ||
				webhookType === "email.delivery_delayed"
			) {
				error = {
					code: event.response?.code,
					message:
						event.response?.content ||
						event.bounce_classification ||
						"Delivery failed",
				};
			}

			const data = emailDataFromLog(email, error);
			const sourceKey = `${email.organizationId}:${webhookType}:${email.id}:${event.type}:${event.id}`;

			await dispatchWebhookEvent({
				type: webhookType,
				data: data as unknown as Record<string, unknown>,
				organizationId: email.organizationId,
				source: "kumomta",
				idempotencyKey: sourceKey,
			});
		},
		queue,
	);
}
