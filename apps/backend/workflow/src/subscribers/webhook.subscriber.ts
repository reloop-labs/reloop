import { dispatchWebhookEvent } from "@be/workflow/lib/webhook-dispatcher";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { WEBHOOK_DISPATCHER_QUEUE_GROUP } from "@reloop/webhook-delivery";
import {
	buildApiKeyWebhookData,
	buildContactGroupWebhookData,
	buildContactWebhookData,
	buildDomainWebhookData,
	buildEmailWebhookData,
	buildInboundEmailWebhookData,
	statusForEmailWebhookType,
	type EmailWebhookData,
} from "@reloop/webhook-events";
import { eq } from "drizzle-orm";
import { log } from "evlog";

function emailDataFromLog(
	email: typeof schema.emailLog.$inferSelect,
	options?: {
		error?: EmailWebhookData["error"];
		/** Override status so we don't race the logs Kumo subscriber. */
		status?: string;
		url?: string;
	},
): EmailWebhookData {
	return buildEmailWebhookData({
		emailId: email.id,
		from: email.fromEmail,
		to: email.toEmails,
		subject: email.subject ?? null,
		status: options?.status ?? email.status,
		error: options?.error,
		url: options?.url,
	});
}

async function domainDataFromBus(payload: {
	domainId: string;
	domain: string;
}): Promise<ReturnType<typeof buildDomainWebhookData>> {
	const row = await db.query.domain.findFirst({
		where: eq(schema.domain.id, payload.domainId),
		columns: { id: true, domain: true, status: true },
	});
	return buildDomainWebhookData({
		id: payload.domainId,
		name: payload.domain,
		status: row?.status ?? null,
	});
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

	// ── Domain lifecycle ─────────────────────────────────────────────────
	await bus.subscribe(
		BusEvent.DOMAIN_CREATED,
		async (payload) => {
			const data = await domainDataFromBus(payload);
			await dispatchWebhookEvent({
				type: "domain.create",
				data: data as unknown as Record<string, unknown>,
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
			const data = await domainDataFromBus(payload);
			await dispatchWebhookEvent({
				type: "domain.update",
				data: data as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "domain",
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.DOMAIN_DELETED,
		async (payload) => {
			const data = await domainDataFromBus(payload);
			await dispatchWebhookEvent({
				type: "domain.delete",
				data: data as unknown as Record<string, unknown>,
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
			const data = await domainDataFromBus(payload);
			await dispatchWebhookEvent({
				type: "domain.undelete",
				data: data as unknown as Record<string, unknown>,
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
			const data = await domainDataFromBus(payload);
			// Verification always lands the domain in active when the event fires.
			const verified = buildDomainWebhookData({
				id: data.id,
				name: data.name,
				status: data.status ?? "active",
			});
			await dispatchWebhookEvent({
				type: "domain.verify",
				data: verified as unknown as Record<string, unknown>,
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
				data: buildApiKeyWebhookData({
					apiKeyId: payload.api_key_id,
				}) as unknown as Record<string, unknown>,
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
				data: buildApiKeyWebhookData({
					apiKeyId: payload.api_key_id,
				}) as unknown as Record<string, unknown>,
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
				data: buildApiKeyWebhookData({
					apiKeyId: payload.api_key_id,
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "api-key",
				idempotencyKey: `${payload.organizationId}:api-key.delete:${payload.api_key_id}`,
			});
		},
		queue,
	);

	// Soft revoke (disable) → api-key.revoke
	await bus.subscribe(
		BusEvent.API_KEY_DISABLED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.revoke",
				data: buildApiKeyWebhookData({
					apiKeyId: payload.api_key_id,
					status: "disabled",
					action: "revoked",
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "api-key",
				idempotencyKey: `${payload.organizationId}:api-key.revoke:${payload.api_key_id}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.API_KEY_ENABLED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "api-key.update",
				data: buildApiKeyWebhookData({
					apiKeyId: payload.api_key_id,
					status: "enabled",
					action: "enabled",
				}) as unknown as Record<string, unknown>,
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
				data: buildApiKeyWebhookData({
					apiKeyId: payload.api_key_id,
					action: "rotated",
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "api-key",
			});
		},
		queue,
	);

	// ── Contact lifecycle ────────────────────────────────────────────────
	async function dispatchContactLifecycle(
		type: string,
		payload: {
			organizationId: string;
			contactId: string;
			email: string;
			firstName?: string | null;
			lastName?: string | null;
			status: string;
		},
		idempotent: boolean,
	) {
		await dispatchWebhookEvent({
			type,
			data: buildContactWebhookData({
				id: payload.contactId,
				email: payload.email,
				firstName: payload.firstName,
				lastName: payload.lastName,
				status: payload.status,
			}) as unknown as Record<string, unknown>,
			organizationId: payload.organizationId,
			source: "contact",
			idempotencyKey: idempotent
				? `${payload.organizationId}:${type}:${payload.contactId}`
				: undefined,
		});
	}

	await bus.subscribe(
		BusEvent.CONTACT_CREATED,
		async (payload) => {
			await dispatchContactLifecycle("contact.create", payload, true);
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_UPDATED,
		async (payload) => {
			await dispatchContactLifecycle("contact.update", payload, false);
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_DELETED,
		async (payload) => {
			await dispatchContactLifecycle("contact.delete", payload, true);
		},
		queue,
	);

	// Status transitions can repeat (re-subscribe, re-block).
	await bus.subscribe(
		BusEvent.CONTACT_SUBSCRIBED,
		async (payload) => {
			await dispatchContactLifecycle("contact.subscribed", payload, false);
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_UNSUBSCRIBED,
		async (payload) => {
			await dispatchContactLifecycle("contact.unsubscribed", payload, false);
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_BLOCKED,
		async (payload) => {
			await dispatchContactLifecycle("contact.blocked", payload, false);
		},
		queue,
	);

	// Auto-created contacts (from outbound send) → contact.create when brand-new
	await bus.subscribe(
		BusEvent.CONTACT_AUTO_CREATED,
		async (payload) => {
			if (!payload.created) return;
			await dispatchWebhookEvent({
				type: "contact.create",
				data: buildContactWebhookData({
					id: payload.contactId,
					email: payload.email,
					status: "subscribed",
					source: "auto",
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "contact",
				idempotencyKey: `${payload.organizationId}:contact.create:${payload.contactId}`,
			});
		},
		queue,
	);

	// Deliverability suppressions → contact.blocked when contact was suppressed
	await bus.subscribe(
		BusEvent.CONTACT_DELIVERABILITY_UPDATED,
		async (payload) => {
			if (!payload.suppressed) return;
			await dispatchWebhookEvent({
				type: "contact.blocked",
				data: buildContactWebhookData({
					id: payload.contactId,
					email: payload.email,
					status: "blocked",
					deliverability: payload.deliverability,
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "contact",
				idempotencyKey: `${payload.organizationId}:contact.blocked:${payload.contactId}:${payload.emailLogId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_GROUP_CREATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "contact.group.create",
				data: buildContactGroupWebhookData({
					id: payload.groupId,
					name: payload.name,
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "contact",
				idempotencyKey: `${payload.organizationId}:contact.group.create:${payload.groupId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_GROUP_UPDATED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "contact.group.update",
				data: buildContactGroupWebhookData({
					id: payload.groupId,
					name: payload.name,
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "contact",
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.CONTACT_GROUP_DELETED,
		async (payload) => {
			await dispatchWebhookEvent({
				type: "contact.group.delete",
				data: buildContactGroupWebhookData({
					id: payload.groupId,
					name: payload.name,
				}) as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "contact",
				idempotencyKey: `${payload.organizationId}:contact.group.delete:${payload.groupId}`,
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

			const data = emailDataFromLog(email, { status: "sent" });
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
		BusEvent.EMAIL_SCHEDULED,
		async (payload) => {
			log.info({
				message: "Received email.scheduled — dispatching webhooks",
				emailLogId: payload.emailLogId,
				organizationId: payload.organizationId,
				scheduledAt: payload.scheduledAt,
			});

			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, payload.emailLogId),
			});

			if (!email) {
				log.warn({
					message: "Email log not found for scheduled webhook dispatch",
					emailLogId: payload.emailLogId,
				});
				return;
			}

			const data = emailDataFromLog(email, {
				status: "scheduled",
			});
			// scheduled_at is part of the public contract for this event only.
			const withSchedule = {
				...data,
				scheduled_at: payload.scheduledAt,
			};
			await dispatchWebhookEvent({
				type: "email.scheduled",
				data: withSchedule as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "email",
				idempotencyKey: `${payload.organizationId}:email.scheduled:${email.id}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.EMAIL_OPENED,
		async (payload) => {
			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, payload.emailLogId),
			});
			if (!email?.organizationId) return;

			const data = emailDataFromLog(email);
			await dispatchWebhookEvent({
				type: "email.opened",
				data: data as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "tracking",
				idempotencyKey: `${payload.organizationId}:email.opened:${payload.emailEventId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.EMAIL_CLICKED,
		async (payload) => {
			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, payload.emailLogId),
			});
			if (!email?.organizationId) return;

			const data = emailDataFromLog(email, { url: payload.url });
			await dispatchWebhookEvent({
				type: "email.clicked",
				data: data as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "tracking",
				idempotencyKey: `${payload.organizationId}:email.clicked:${payload.emailEventId}`,
			});
		},
		queue,
	);

	await bus.subscribe(
		BusEvent.EMAIL_FAILED,
		async (payload) => {
			const email = await db.query.emailLog.findFirst({
				where: eq(schema.emailLog.id, payload.emailLogId),
			});
			if (!email?.organizationId) return;

			const data = emailDataFromLog(email, {
				status: "failed",
				error: { message: payload.errorMessage },
			});
			await dispatchWebhookEvent({
				type: "email.failed",
				data: data as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "email",
				idempotencyKey: `${payload.organizationId}:email.failed:${email.id}`,
			});
		},
		queue,
	);

	// Inbound mailbox receive → email.received
	await bus.subscribe(
		BusEvent.INBOUND_EMAIL_RECEIVED,
		async (payload) => {
			const data = buildInboundEmailWebhookData({
				emailId: payload.inboundEmailId,
				mailboxId: payload.mailboxId,
				from: payload.fromEmail,
				fromName: payload.fromName,
				to: payload.toEmails,
				cc: payload.ccEmails,
				subject: payload.subject,
				threadId: payload.threadId,
				hasAttachments: payload.hasAttachments,
				isSpam: payload.isSpam,
				messageId: payload.messageId,
			});
			await dispatchWebhookEvent({
				type: "email.received",
				data: data as unknown as Record<string, unknown>,
				organizationId: payload.organizationId,
				source: "inbox",
				idempotencyKey: `${payload.organizationId}:email.received:${payload.inboundEmailId}`,
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
			} else if (
				event.type === "Bounce" ||
				event.type === "AdminBounce" ||
				event.type === "OOB"
			) {
				webhookType = "email.bounced";
			} else if (event.type === "TransientFailure") {
				webhookType = "email.delivery_delayed";
			} else if (event.type === "Feedback") {
				webhookType = "email.complained";
			} else if (event.type === "Expiration") {
				webhookType = "email.failed";
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
				webhookType === "email.delivery_delayed" ||
				webhookType === "email.failed"
			) {
				error = {
					code: event.response?.code,
					message:
						event.response?.content ||
						event.bounce_classification ||
						(webhookType === "email.failed"
							? "Message expired"
							: "Delivery failed"),
				};
			}

			const data = emailDataFromLog(email, {
				error,
				status: statusForEmailWebhookType(webhookType),
			});
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
