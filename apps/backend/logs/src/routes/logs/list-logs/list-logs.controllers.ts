import type { LogsTypes } from "@reloop/logs/types/logs.type";
import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import { status } from "elysia";

function escapeString(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function safeJsonParse(value: string, fallback: unknown): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return fallback;
	}
}

export async function listLogsController(
	query: LogsTypes.ListLogsQuery,
): Promise<LogsTypes.ListLogsResponse> {
	try {
		const client = getClickHouseClient();
		const conditions: string[] = [];

		if (query.level) {
			conditions.push(`level = '${escapeString(query.level)}'`);
		}

		if (query.event) {
			conditions.push(`event = '${escapeString(query.event)}'`);
		}

		if (query.organization_id) {
			conditions.push(
				`organization_id = '${escapeString(query.organization_id)}'`,
			);
		}

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const limit = Math.min(Math.max(Number(query.limit || 25), 1), 100);

		const resultSet = await client.query({
			query: `
				SELECT
					id,
					event,
					level,
					trace_id,
					user_id,
					organization_id,
					metadata,
					request_details,
					toString(created_at) AS created_at
				FROM logs
				${whereClause}
				ORDER BY created_at DESC
				LIMIT ${limit}
			`,
			format: "JSONEachRow",
		});

		const rows = (await resultSet.json()) as StoredLogEntry[];

		const logs = rows.map((row) => ({
			uuid: row.id,
			event: row.event,
			level: row.level,
			trace_id: row.trace_id,
			metadata: safeJsonParse(row.metadata, {}),
			created_at: row.created_at,
			request_details: safeJsonParse(row.request_details, {}),
		}));

		return {
			logs,
			count: logs.length,
		};
	} catch (error) {
		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to list logs",
		});
	}
}
