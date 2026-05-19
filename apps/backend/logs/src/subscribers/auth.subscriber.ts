import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import { insertAuditLog } from "@reloop/logs/utils/insert-audit-log";

export async function initAuthSubscribers() {
	await bus.subscribe(
		BusEvent.USER_CREATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.USER_CREATED,
					level: "info",
					service: "auth",
					action: "created",
					actor_type: "system",
					actor_id: payload.id,
					resource_type: "user",
					resource_id: payload.id,
					organization_id: null,
					user_id: payload.id,
					metadata: { email: payload.email, name: payload.name },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log user.created" });
			}
		},
		{ queue: "logs-user-created" },
	);

	await bus.subscribe(
		BusEvent.SIGNIN_DETECTED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.SIGNIN_DETECTED,
					level: "info",
					service: "auth",
					action: "signed_in",
					actor_type: "user",
					actor_id: null,
					resource_type: "session",
					resource_id: null,
					organization_id: null,
					user_id: null,
					ip_address: payload.ip,
					metadata: {
						email: payload.email,
						browser: payload.browser,
						os: payload.os,
						location: payload.location,
					},
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log signin.detected" });
			}
		},
		{ queue: "logs-signin-detected" },
	);

	await bus.subscribe(
		BusEvent.ORGANIZATION_CREATED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.ORGANIZATION_CREATED,
					level: "info",
					service: "auth",
					action: "created",
					actor_type: "user",
					actor_id: null,
					resource_type: "organization",
					resource_id: payload.id,
					organization_id: payload.id,
					user_id: null,
					metadata: { name: payload.name, slug: payload.slug },
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log organization.created" });
			}
		},
		{ queue: "logs-org-created" },
	);

	await bus.subscribe(
		BusEvent.ORGANIZATION_JOINED,
		async (payload) => {
			try {
				await insertAuditLog({
					event: BusEvent.ORGANIZATION_JOINED,
					level: "info",
					service: "auth",
					action: "joined",
					actor_type: "user",
					actor_id: payload.userId,
					resource_type: "organization",
					resource_id: payload.organizationId,
					organization_id: payload.organizationId,
					user_id: payload.userId,
					metadata: {
						orgName: payload.orgName,
						role: payload.role,
						inviterName: payload.inviterName,
					},
				});
			} catch (error) {
				log.error({ error, payload, message: "Failed to log organization.joined" });
			}
		},
		{ queue: "logs-org-joined" },
	);

	log.info("server", "Auth audit subscribers registered");
}
