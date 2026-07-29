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

const EVENT_STATUS_MAP: Partial<
	Record<
		KumomtaEventType,
		"pending" | "sent" | "delivered" | "failed" | "bounced" | "spam"
	>
> = {
	Delivery: "delivered",
	Bounce: "bounced",
	Expiration: "failed",
	AdminBounce: "bounced",
	OOB: "bounced",
	Feedback: "spam",
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

				const newStatus = EVENT_STATUS_MAP[event.type as KumomtaEventType];

				if (!newStatus) {
					// Events like Reception, TransientFailure — log but don't update status
					log.debug({
						type: event.type,
						emailLogId,
						kumomtaId: event.id,
						message: `KumoMTA ${event.type} event received (no status update)`,
					});
					return;
				}

				const updateData: Record<string, unknown> = {
					status: newStatus,
					updatedAt: new Date(),
				};

				switch (event.type) {
					case "Delivery":
						updateData.deliveredAt = new Date();
						updateData.providerMessageId = event.id;
						break;

					case "Bounce":
					case "AdminBounce":
					case "OOB":
						updateData.failedAt = new Date();
						updateData.errorMessage = formatErrorMessage(event);
						break;

					case "Expiration":
						updateData.failedAt = new Date();
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
					newStatus,
					kumomtaId: event.id,
					recipient: event.recipient,
					message: `Email status updated to ${newStatus}`,
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

	log.info("server", "KumoMTA log subscriber registered");
}
