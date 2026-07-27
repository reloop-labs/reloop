import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logsConfig } from "@reloop/logs/logs.config";
import { log } from "evlog";

/** Generate a lowercase prefixed request ID */
export const createRequestId = () => `req_${createId()}`;

export type AuditLogEntry = {
	event: string;
	level: string;
	service: string;
	action: string;
	actor_type: string;
	actor_id: string | null;
	resource_type: string;
	resource_id: string | null;
	organization_id: string | null;
	user_id: string | null;
	metadata: Record<string, unknown>;
	trace_id?: string | null;
	ip_address?: string | null;
	user_agent?: string | null;
	environment?: string;
	request_details?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
		requestBody?: Record<string, unknown> | null;
	} | null;
	request_body?: Record<string, unknown> | null;
	status_code?: number | null;
};

const ENV =
	(logsConfig.NODE_ENV as string) === "production"
		? "production"
		: "development";

/**
 * Inserts a structured audit-log row into Postgres.
 * All subscribers call this instead of duplicating insert logic.
 */
export async function insertAuditLog(entry: AuditLogEntry): Promise<void> {
	try {
		await db.insert(schema.activityLog).values({
			id: entry.trace_id || createRequestId(),
			event: entry.event,
			level: entry.level,
			traceId: entry.trace_id ?? null,
			userId: entry.user_id ?? null,
			organizationId: entry.organization_id ?? null,
			metadata: entry.metadata ?? {},
			requestDetails: entry.request_details ?? {},
			requestBody:
				entry.request_body ?? entry.request_details?.requestBody ?? {},
			statusCode: entry.status_code ?? null,
			createdAt: new Date(),
			actorType: entry.actor_type,
			actorId: entry.actor_id ?? null,
			resourceType: entry.resource_type,
			resourceId: entry.resource_id ?? null,
			service: entry.service,
			action: entry.action,
			ipAddress: entry.ip_address ?? null,
			userAgent: entry.user_agent ?? null,
			environment: entry.environment ?? ENV,
		});
	} catch (error) {
		log.error({
			message: "Failed to insert audit log into Postgres",
			error:
				error instanceof Error
					? { message: error.message, stack: error.stack }
					: error,
			event: entry.event,
			service: entry.service,
		});
	}
}
