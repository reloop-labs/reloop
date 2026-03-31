import { logger } from "@reloop/logger";
import type { LogsTypes } from "@reloop/logs/types/logs.type";
import { listLogs } from "@reloop/logs/utils/clickhouse";
import { status } from "elysia";

export async function listLogsController(
	query: LogsTypes.ListLogsQuery,
): Promise<LogsTypes.ListLogsResponse> {
	try {
		const logs = await listLogs(query);

		logger.info(
			{
				count: logs.length,
				service: query.service || null,
				level: query.level || null,
				event: query.event || null,
			},
			"Logs listed successfully",
		);

		return {
			logs,
			count: logs.length,
		};
	} catch (error) {
		logger.error(
			{
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing logs",
		);

		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to list logs",
		});
	}
}
