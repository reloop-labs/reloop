import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";

export async function initBillingSubscribers() {
	await bus.subscribe(
		BusEvent.QUOTA_WARNING,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.QUOTA_WARNING,
					level: "warn",
					service: "billing",
					action: "warned",
					actor_type: "system",
					actor_id: null,
					resource_type: "quota",
					resource_id: null,
					organization_id: null,
					user_id: null,
					metadata: {
						percentage: payload.percentage,
						resourceType: payload.resourceType,
					},
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log quota.warning" });
			}
		},
		{ queue: "logs-quota-warning" },
	);

	await bus.subscribe(
		BusEvent.QUOTA_EXCEEDED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.QUOTA_EXCEEDED,
					level: "error",
					service: "billing",
					action: "exceeded",
					actor_type: "system",
					actor_id: null,
					resource_type: "quota",
					resource_id: null,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: {
						creditsUsed: payload.creditsUsed,
						monthlyCredits: payload.monthlyCredits,
					},
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log quota.exceeded" });
			}
		},
		{ queue: "logs-quota-exceeded" },
	);

	await bus.subscribe(
		BusEvent.PAYMENT_FAILED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.PAYMENT_FAILED,
					level: "error",
					service: "billing",
					action: "failed",
					actor_type: "system",
					actor_id: null,
					resource_type: "payment",
					resource_id: null,
					organization_id: null,
					user_id: null,
					metadata: { planName: payload.planName, amount: payload.amount },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log payment.failed" });
			}
		},
		{ queue: "logs-payment-failed" },
	);

	log.info("server", "Billing audit subscribers registered");
}
