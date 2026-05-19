import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";

export async function initDomainSubscribers() {
	await bus.subscribe(
		BusEvent.DOMAIN_CREATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.DOMAIN_CREATED,
					level: "info",
					service: "domain",
					action: "created",
					actor_type: "user",
					actor_id: null,
					resource_type: "domain",
					resource_id: payload.domainId,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { domainId: payload.domainId, domain: payload.domain },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log domain.created" });
			}
		},
		{ queue: "logs-domain-created" },
	);

	await bus.subscribe(
		BusEvent.DOMAIN_UPDATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.DOMAIN_UPDATED,
					level: "info",
					service: "domain",
					action: "updated",
					actor_type: "user",
					actor_id: null,
					resource_type: "domain",
					resource_id: payload.domainId,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { domainId: payload.domainId, domain: payload.domain },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log domain.updated" });
			}
		},
		{ queue: "logs-domain-updated" },
	);

	await bus.subscribe(
		BusEvent.DOMAIN_DELETED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.DOMAIN_DELETED,
					level: "warn",
					service: "domain",
					action: "deleted",
					actor_type: "user",
					actor_id: null,
					resource_type: "domain",
					resource_id: payload.domainId,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { domainId: payload.domainId, domain: payload.domain },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log domain.deleted" });
			}
		},
		{ queue: "logs-domain-deleted" },
	);

	await bus.subscribe(
		BusEvent.DOMAIN_UNDELETED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.DOMAIN_UNDELETED,
					level: "info",
					service: "domain",
					action: "restored",
					actor_type: "user",
					actor_id: null,
					resource_type: "domain",
					resource_id: payload.domainId,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { domainId: payload.domainId, domain: payload.domain },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log domain.undeleted" });
			}
		},
		{ queue: "logs-domain-restored" },
	);

	await bus.subscribe(
		BusEvent.DOMAIN_VERIFIED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.DOMAIN_VERIFIED,
					level: "info",
					service: "domain",
					action: "verified",
					actor_type: "system",
					actor_id: null,
					resource_type: "domain",
					resource_id: payload.domainId,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { domainId: payload.domainId, domain: payload.domain },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log domain.verified" });
			}
		},
		{ queue: "logs-domain-verified" },
	);

	log.info("server", "Domain audit subscribers registered");
}
