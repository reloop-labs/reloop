import { createId } from "@paralleldrive/cuid2";
import { logsConfig } from "@reloop/logs/logs.config";
import { getClickHouseClient } from "@reloop/logs/utils/clickhouse";
import { toClickHouseDate } from "@reloop/logs/utils/format";
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
 * Inserts a structured audit-log row into ClickHouse.
 * All subscribers call this instead of duplicating insert logic.
 */
export async function insertAuditLog(entry: AuditLogEntry): Promise<void> {
	try {
		const client = getClickHouseClient();
		await client.insert({
			table: "logs",
			values: [
				{
					id: entry.trace_id || createRequestId(),
					event: entry.event,
					level: entry.level,
					trace_id: entry.trace_id ?? null,
					user_id: entry.user_id ?? null,
					organization_id: entry.organization_id ?? null,
					metadata: JSON.stringify(entry.metadata),
					request_details: JSON.stringify(entry.request_details ?? {}),
					request_body: JSON.stringify(entry.request_body ?? entry.request_details?.requestBody ?? {}),
					status_code: entry.status_code ?? null,
					created_at: toClickHouseDate(new Date()),
					// Audit-log fields — LowCardinality columns use '' as the "no value" sentinel
					actor_type: entry.actor_type,
					actor_id: entry.actor_id ?? null,
					resource_type: entry.resource_type,
					resource_id: entry.resource_id ?? null,
					service: entry.service,
					action: entry.action,
					ip_address: entry.ip_address ?? null,
					user_agent: entry.user_agent ?? null,
					environment: entry.environment ?? ENV,
				},
			],
			format: "JSONEachRow",
		});
	} catch (error) {
		log.error({
			message: "Failed to insert audit log into ClickHouse",
			error:
				error instanceof Error
					? { message: error.message, stack: error.stack }
					: error,
			event: entry.event,
			service: entry.service,
		});
	}
}
