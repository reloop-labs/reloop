import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";

export async function initApiKeySubscribers() {
	await bus.subscribe(
		BusEvent.API_KEY_CREATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.API_KEY_CREATED,
					level: "info",
					service: "api_key",
					action: "created",
					actor_type: "user",
					actor_id: null,
					resource_type: "api_key",
					resource_id: payload.api_key_id,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { api_key_id: payload.api_key_id },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log api_key.created" });
			}
		},
		{ queue: "logs-api-key-created" },
	);

	await bus.subscribe(
		BusEvent.API_KEY_DELETED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.API_KEY_DELETED,
					level: "info",
					service: "api_key",
					action: "deleted",
					actor_type: "user",
					actor_id: null,
					resource_type: "api_key",
					resource_id: payload.api_key_id,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { api_key_id: payload.api_key_id },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log api_key.deleted" });
			}
		},
		{ queue: "logs-api-key-deleted" },
	);

	await bus.subscribe(
		BusEvent.API_KEY_UPDATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.API_KEY_UPDATED,
					level: "info",
					service: "api_key",
					action: "updated",
					actor_type: "user",
					actor_id: null,
					resource_type: "api_key",
					resource_id: payload.api_key_id,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { api_key_id: payload.api_key_id },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log api_key.updated" });
			}
		},
		{ queue: "logs-api-key-updated" },
	);

	await bus.subscribe(
		BusEvent.API_KEY_ROTATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.API_KEY_ROTATED,
					level: "info",
					service: "api_key",
					action: "rotated",
					actor_type: "user",
					actor_id: null,
					resource_type: "api_key",
					resource_id: payload.api_key_id,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { api_key_id: payload.api_key_id },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log api_key.rotated" });
			}
		},
		{ queue: "logs-api-key-rotated" },
	);

	await bus.subscribe(
		BusEvent.API_KEY_ENABLED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.API_KEY_ENABLED,
					level: "info",
					service: "api_key",
					action: "enabled",
					actor_type: "user",
					actor_id: null,
					resource_type: "api_key",
					resource_id: payload.api_key_id,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { api_key_id: payload.api_key_id },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log api_key.enabled" });
			}
		},
		{ queue: "logs-api-key-enabled" },
	);

	await bus.subscribe(
		BusEvent.API_KEY_DISABLED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.API_KEY_DISABLED,
					level: "info",
					service: "api_key",
					action: "disabled",
					actor_type: "user",
					actor_id: null,
					resource_type: "api_key",
					resource_id: payload.api_key_id,
					organization_id: payload.organizationId,
					user_id: null,
					metadata: { api_key_id: payload.api_key_id },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log api_key.disabled" });
			}
		},
		{ queue: "logs-api-key-disabled" },
	);

	log.info("server", "API key audit subscribers registered");
}
