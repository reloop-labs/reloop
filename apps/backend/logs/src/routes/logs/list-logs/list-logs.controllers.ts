import type { LogsTypes } from "@reloop/logs/types/logs.type";
import { listLogs } from "@reloop/logs/utils/clickhouse";
import { status } from "elysia";

export async function listLogsController(
	query: LogsTypes.ListLogsQuery,
): Promise<LogsTypes.ListLogsResponse> {
	try {
		const logs = await listLogs(query);

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
