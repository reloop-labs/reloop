import { db } from "@reloop/db/client";
import { emailLog } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { eq } from "drizzle-orm";

/**
 * KumoMTA log event types
 * @see https://docs.kumomta.com/reference/log_record/
 */
export type KumomtaEventType =
	| "Reception"
	| "Delivery"
	| "Bounce"
	| "TransientFailure"
	| "Expiration"
	| "OOB"
	| "Feedback"
	| "AdminBounce";

export interface KumomtaLogRecord {
	type: KumomtaEventType;
	id: string;
	sender: string;
	recipient: string;
	queue: string;
	site: string;
	size: number;
	bounce_classification?: string;
	response: {
		code: number;
		enhanced_code?: {
			class: number;
			subject: number;
			detail: number;
		};
		content: string;
		command?: string;
	};
	headers: {
		Subject?: string;
		"X-Org-ID"?: string;
		"X-Domain-ID"?: string;
		"X-Email-Log-ID"?: string;
	};
	meta?: {
		"X-Email-Log-ID"?: string;
		[key: string]: unknown;
	};
	timestamp?: string;
}

/** Maps KumoMTA event type → emailLog status update */
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
	Feedback: "spam",
};

/**
 * Process a batch of KumoMTA log events and update emailLog records.
 */
export async function handleKumomtaWebhookController({
	events,
	logger,
}: {
	events: KumomtaLogRecord[];
	logger: Logger;
}): Promise<{ processed: number; errors: number }> {
	let processed = 0;
	let errors = 0;

	for (const event of events) {
		try {
			let emailLogId =
				event.headers?.["X-Email-Log-ID"] || event.meta?.["X-Email-Log-ID"];

			if (!emailLogId) {
				// Fallback: look up by providerMessageId which corresponds to event.id (msg:id())
				const logEntry = await db.query.emailLog.findFirst({
					where: eq(emailLog.providerMessageId, event.id),
					columns: { id: true },
				});
				if (logEntry) emailLogId = logEntry.id;
			}

			if (!emailLogId) {
				logger.warn(
					{
						kumomtaId: event.id,
						type: event.type,
						recipient: event.recipient,
					},
					"KumoMTA event missing X-Email-Log-ID header and provider tracking ID, skipping",
				);
				continue;
			}

			const newStatus = EVENT_STATUS_MAP[event.type];

			if (!newStatus) {
				// Events like Reception, TransientFailure — log but don't update status
				logger.debug(
					{
						type: event.type,
						emailLogId,
						kumomtaId: event.id,
					},
					`KumoMTA ${event.type} event received (no status update)`,
				);
				processed++;
				continue;
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
				.update(emailLog)
				.set(updateData)
				.where(eq(emailLog.id, emailLogId));

			logger.info(
				{
					emailLogId,
					type: event.type,
					newStatus,
					kumomtaId: event.id,
					recipient: event.recipient,
				},
				`Email status updated to ${newStatus}`,
			);

			processed++;
		} catch (error) {
			errors++;
			logger.error(
				{
					error: error instanceof Error ? error.message : String(error),
					kumomtaId: event.id,
					type: event.type,
				},
				"Failed to process KumoMTA webhook event",
			);
		}
	}

	logger.info(
		{ processed, errors, total: events.length },
		"KumoMTA webhook batch processed",
	);

	return { processed, errors };
}

function formatErrorMessage(event: KumomtaLogRecord): string {
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
