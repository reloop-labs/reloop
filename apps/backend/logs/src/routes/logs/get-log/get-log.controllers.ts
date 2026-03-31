import {
	getClickHouseClient,
	type StoredLogEntry,
} from "@reloop/logs/utils/clickhouse";
import { status } from "elysia";
import type { LogsTypes } from "../../../types/logs.type";

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

export async function getLogController(
	logId: string,
): Promise<LogsTypes.LogEntryResponse> {
	try {
		const client = getClickHouseClient();

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
				WHERE id = '${escapeString(logId)}'
				LIMIT 1
			`,
			format: "JSONEachRow",
		});

		const rows = (await resultSet.json()) as StoredLogEntry[];
		const row = rows[0];

		if (!row) {
			throw status(404, {
				message: "Log not found",
			});
		}

		return {
			uuid: row.id,
			event: row.event,
			level: row.level,
			trace_id: row.trace_id,
			metadata: safeJsonParse(row.metadata, {}),
			created_at: row.created_at,
			request_details: safeJsonParse(row.request_details, {}),
		};
	} catch (error) {
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}

		throw status(500, {
			message:
				error instanceof Error ? error.message : "Failed to retrieve log",
		});
	}
}
