import { BusEvent, bus } from "@reloop/bus";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";
import { log } from "evlog";

export async function initLogSubscriber() {
	await bus.subscribe(
		BusEvent.LOG_CREATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: payload.event,
					level: payload.level,
					service: payload.service ?? "",
					action: payload.action ?? "",
					actor_type: payload.actor_type ?? "system",
					actor_id: payload.actor_id ?? null,
					resource_type: payload.resource_type ?? "",
					resource_id: payload.resource_id ?? null,
					organization_id: payload.organization_id ?? null,
					user_id: payload.user_id ?? null,
					trace_id: payload.trace_id ?? null,
					ip_address:
						payload.ip_address ?? payload.requestDetails?.ipAddress ?? null,
					user_agent:
						payload.user_agent ?? payload.requestDetails?.userAgent ?? null,
					environment: payload.environment,
					metadata: payload.metadata ?? {},
				});
			} catch (error) {
				log.error({
					message: "Failed to insert audit log",
					error: error instanceof Error ? error.message : String(error),
					event: payload.event,
				});
			}
		},
		{ queue: "logs-worker" },
	);

	log.info("server", "Log subscriber registered");
}
