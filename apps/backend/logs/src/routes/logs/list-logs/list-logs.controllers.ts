import type { LogsTypes } from "@reloop/logs/types/logs.type";
import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import {
	escapeString,
	formatClickHouseDate,
	safeJsonParse,
} from "@reloop/logs/utils/format";
import { status } from "elysia";

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
		const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
		const page = Math.max(Number(query.page || 1), 1);
		const offset = (page - 1) * limit;

		// Get total count for pagination
		const countResultSet = await client.query({
			query: `SELECT count() as total FROM logs ${whereClause}`,
			format: "JSONEachRow",
		});
		const countRows = (await countResultSet.json()) as { total: string }[];
		const totalCount = Number(countRows[0]?.total || 0);

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
				LIMIT ${limit} OFFSET ${offset}
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
			created_at: formatClickHouseDate(row.created_at),
			requestDetails: safeJsonParse(row.request_details, {}),
		}));

		return {
			logs,
			count: totalCount,
		};
	} catch (error) {
		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to list logs",
		});
	}
}
