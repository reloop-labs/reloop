import { BusEvent, bus, type KumomtaLogRecordPayload } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export type KumomtaEventType =
	| "Reception"
	| "Delivery"
	| "Bounce"
	| "TransientFailure"
	| "Expiration"
	| "OOB"
	| "Feedback"
	| "AdminBounce";

/** Map Kumo log type → email_log.status (omit types that only create events). */
const EVENT_STATUS_MAP: Partial<
	Record<
		KumomtaEventType,
		"pending" | "sent" | "delivered" | "failed" | "bounced" | "spam"
	>
> = {
	Reception: "sent",
	Delivery: "delivered",
	Bounce: "bounced",
	Expiration: "failed",
	AdminBounce: "bounced",
	OOB: "bounced",
	Feedback: "spam",
	// TransientFailure → deferred event only, status stays as-is
};

/** Map Kumo log type → email_event.type (must match email_event_type enum). */
const EVENT_TYPE_MAP: Partial<
	Record<
		KumomtaEventType,
		| "sent"
		| "delivered"
		| "opened"
		| "clicked"
		| "bounced"
		| "complaint"
		| "unsubscribed"
		| "deferred"
	>
> = {
	Reception: "sent",
	Delivery: "delivered",
	Bounce: "bounced",
	AdminBounce: "bounced",
	OOB: "bounced",
	Expiration: "bounced",
	Feedback: "complaint",
	TransientFailure: "deferred",
};

function formatErrorMessage(event: KumomtaLogRecordPayload): string {
	const parts: string[] = [];

	if (event.bounce_classification) {
		parts.push(`Classification: ${event.bounce_classification}`);
	}

	if (event.response?.code) {
		parts.push(`SMTP ${event.response.code}`);
	}

	if (event.response?.content) {
		parts.push(event.response.content);
	}

	return parts.join(" — ") || "Unknown bounce reason";
}

/**
 * Structured SMTP / Kumo response stored on email_event.metadata.
 * This is the remote MTA reply (or our reception), not the outbound MIME raw.
 */
function buildEventMetadata(
	event: KumomtaLogRecordPayload,
): Record<string, unknown> {
	return {
		source: "kumomta",
		kumoType: event.type,
		kumoId: event.id,
		recipient: event.recipient ?? null,
		sender: event.sender ?? null,
		queue: event.queue ?? null,
		site: event.site ?? null,
		size: event.size ?? null,
		bounceClassification: event.bounce_classification ?? null,
		response: event.response
			? {
					code: event.response.code ?? null,
					content: event.response.content ?? null,
					enhancedCode: event.response.enhanced_code ?? null,
					command: event.response.command ?? null,
				}
			: null,
		timestamp: event.timestamp ?? null,
	};
}

function eventTimestamp(event: KumomtaLogRecordPayload): Date {
	if (event.timestamp == null) return new Date();
	if (typeof event.timestamp === "number") {
		// Kumo may send seconds or ms
		const ms =
			event.timestamp < 1e12 ? event.timestamp * 1000 : event.timestamp;
		const d = new Date(ms);
		return Number.isNaN(d.getTime()) ? new Date() : d;
	}
	const d = new Date(event.timestamp);
	return Number.isNaN(d.getTime()) ? new Date() : d;
}

export async function initKumomtaSubscriber() {
	await bus.subscribe(
		BusEvent.KUMOMTA_EVENT,
		async (event) => {
			try {
				let emailLogId =
					event.headers?.["X-Email-Log-ID"] || event.meta?.["X-Email-Log-ID"];

				if (!emailLogId) {
					// Fallback: look up by providerMessageId which corresponds to event.id (msg:id())
					const logEntry = await db.query.emailLog.findFirst({
						where: eq(schema.emailLog.providerMessageId, event.id),
						columns: { id: true },
					});
					if (logEntry) emailLogId = logEntry.id;
				}

				if (!emailLogId) {
					log.warn({
						kumomtaId: event.id,
						type: event.type,
						recipient: event.recipient,
						message:
							"KumoMTA event missing X-Email-Log-ID header and provider tracking ID, skipping",
					});
					return;
				}

				const kumoType = event.type as KumomtaEventType;
				const eventType = EVENT_TYPE_MAP[kumoType];
				const newStatus = EVENT_STATUS_MAP[kumoType];
				const metadata = buildEventMetadata(event);
				const at = eventTimestamp(event);

				// Always persist the SMTP/Kumo response as an email_event when mappable.
				if (eventType) {
					await db.insert(schema.emailEvent).values({
						emailLogId,
						type: eventType,
						metadata,
						createdAt: at,
					});
				} else {
					log.debug({
						type: event.type,
						emailLogId,
						kumomtaId: event.id,
						message: `KumoMTA ${event.type} event received (no email_event mapping)`,
					});
				}

				// Update email_log status / timestamps when this event changes delivery state.
				if (!newStatus) {
					log.info({
						emailLogId,
						type: event.type,
						kumomtaId: event.id,
						recipient: event.recipient,
						responseCode: event.response?.code,
						message: `Stored ${eventType ?? "unmapped"} event (no status change)`,
					});
					return;
				}

				const updateData: Record<string, unknown> = {
					status: newStatus,
					updatedAt: new Date(),
				};

				switch (kumoType) {
					case "Reception":
						updateData.sentAt = at;
						updateData.providerMessageId = event.id;
						break;

					case "Delivery":
						updateData.deliveredAt = at;
						updateData.providerMessageId = event.id;
						break;

					case "Bounce":
					case "AdminBounce":
					case "OOB":
						updateData.failedAt = at;
						updateData.errorMessage = formatErrorMessage(event);
						break;

					case "Expiration":
						updateData.failedAt = at;
						updateData.errorMessage = `Message expired: ${event.response?.content || "delivery timeout"}`;
						break;

					case "Feedback":
						updateData.errorMessage = `Feedback loop: ${event.response?.content || "spam complaint"}`;
						break;
				}

				await db
					.update(schema.emailLog)
					.set(updateData)
					.where(eq(schema.emailLog.id, emailLogId));

				log.info({
					emailLogId,
					type: event.type,
					eventType,
					newStatus,
					kumomtaId: event.id,
					recipient: event.recipient,
					responseCode: event.response?.code,
					message: `Email status updated to ${newStatus}; SMTP response stored on email_event`,
				});
			} catch (error) {
				log.error({
					error: error instanceof Error ? error.message : String(error),
					kumomtaId: event.id,
					type: event.type,
					message: "Failed to process KumoMTA log event",
				});
			}
		},
		{ queue: "logs-kumomta-worker" },
	);
}
