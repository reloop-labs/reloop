import type { LogsTypes } from "@reloop/logs/types/logs.type";
import { getClickHouseClient } from "@reloop/logs/utils/clickhouse";
import { toClickHouseDate } from "@reloop/logs/utils/format";
import { status } from "elysia";

export async function createLogController({
	event,
	level,
	trace_id,
	metadata,
	userId,
	activeOrganizationId,
	requestDetails,
}: LogsTypes.CreateLogBody & {
	userId: string;
	activeOrganizationId: string;
}): Promise<LogsTypes.CreateLogResponse> {
	try {
		const client = getClickHouseClient();
		const id = crypto.randomUUID();
		const occurredAt = new Date().toISOString();
		const entry = {
			id,
			event,
			level,
			trace_id,
			user_id: userId,
			organization_id: activeOrganizationId,
			metadata: JSON.stringify(metadata || {}),
			created_at: toClickHouseDate(occurredAt),
			request_details: JSON.stringify(requestDetails || {}),
		};
		await client.insert({
			table: "logs",
			values: [entry],
			format: "JSONEachRow",
		});
		return {
			uuid: entry.id,
			event: entry.event,
			level: entry.level,
			trace_id: entry.trace_id,
			metadata: metadata || {},
			created_at: occurredAt,
			request_details: requestDetails,
		};
	} catch (error) {
		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to create log",
		});
	}
}
