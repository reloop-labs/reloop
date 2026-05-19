import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";

export async function initEmailSubscribers() {
	await bus.subscribe(
		BusEvent.EMAIL_SENT,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.EMAIL_SENT,
					level: "info",
					service: "mailing",
					action: "sent",
					actor_type: "user",
					actor_id: null,
					resource_type: "email",
					resource_id: payload.emailLogId,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: {
						emailLogId: payload.emailLogId,
						recipientCount: payload.recipientCount,
						timestamp: payload.timestamp,
					},
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log email.sent" });
			}
		},
		{ queue: "logs-email-sent" },
	);

	log.info("server", "Email audit subscribers registered");
}
