import type { LogsTypes } from "@reloop/logs/types/logs.type";
import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import {
	escapeString,
	formatClickHouseDate,
	safeJsonParse,
	toClickHouseDate,
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

		if (query.source) {
			conditions.push(`source = '${escapeString(query.source)}'`);
		}

		if (query.status_code) {
			if (query.status_code === "successes") {
				conditions.push("status_code >= 200 AND status_code < 400");
			} else if (query.status_code === "errors") {
				conditions.push("status_code >= 400");
			} else {
				const numericStatus = Number.parseInt(query.status_code, 10);
				if (!Number.isNaN(numericStatus)) {
					conditions.push(`status_code = ${numericStatus}`);
				}
			}
		}

		if (query.event) {
			conditions.push(`event ILIKE '%${escapeString(query.event)}%'`);
		}

		if (query.search) {
			const searchTerm = escapeString(query.search);
			conditions.push(
				`(event ILIKE '%${searchTerm}%' OR metadata ILIKE '%${searchTerm}%')`,
			);
		}

		if (query.organization_id) {
			conditions.push(
				`organization_id = '${escapeString(query.organization_id)}'`,
			);
		}

		if (query.start_date) {
			conditions.push(
				`created_at >= '${toClickHouseDate(query.start_date)}'`,
			);
		}

		if (query.end_date) {
			conditions.push(
				`created_at <= '${toClickHouseDate(query.end_date)}'`,
			);
		}

		const whereClause =
			conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
		const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
		const page = Math.max(Number(query.page || 1), 1);
		const offset = (page - 1) * limit;

		// Run count, data, and stats queries in parallel
		const [countResultSet, dataResultSet, statsResultSet] = await Promise.all([
			client.query({
				query: `SELECT count() as total FROM logs ${whereClause}`,
				format: "JSONEachRow",
			}),
			client.query({
				query: `
					SELECT
						id,
						event,
						level,
						source,
						trace_id,
						user_id,
						organization_id,
						metadata,
						request_details,
						status_code,
						toString(created_at) AS created_at
					FROM logs
					${whereClause}
					ORDER BY created_at DESC
					LIMIT ${limit} OFFSET ${offset}
				`,
				format: "JSONEachRow",
			}),
			client.query({
				query: `
					SELECT
						level,
						count() as cnt
					FROM logs
					${whereClause}
					GROUP BY level
				`,
				format: "JSONEachRow",
			}),
		]);

		const countRows = (await countResultSet.json()) as { total: string }[];
		const totalCount = Number(countRows[0]?.total || 0);

		const rows = (await dataResultSet.json()) as StoredLogEntry[];

		const statsRows = (await statsResultSet.json()) as {
			level: string;
			cnt: string;
		}[];

		const stats = {
			debug: 0,
			info: 0,
			warn: 0,
			error: 0,
			fatal: 0,
		};
		for (const row of statsRows) {
			const level = row.level as keyof typeof stats;
			if (level in stats) {
				stats[level] = Number(row.cnt);
			}
		}

		const logs = rows.map((row) => ({
			uuid: row.id,
			event: row.event,
			level: row.level,
			source: row.source,
			trace_id: row.trace_id,
			metadata: safeJsonParse(row.metadata, {}),
			status_code: row.status_code,
			created_at: formatClickHouseDate(row.created_at),
			requestDetails: safeJsonParse(row.request_details, {}),
		}));

		return {
			logs,
			count: totalCount,
			stats,
		};
	} catch (error) {
		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to list logs",
		});
	}
}
