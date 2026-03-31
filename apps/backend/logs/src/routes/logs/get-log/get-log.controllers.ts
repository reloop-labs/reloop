import { logger } from "@reloop/logger";
import { getLogById } from "@reloop/logs/utils/clickhouse";
import { status } from "elysia";
import type { LogsTypes } from "../../../types/logs.type";

export async function getLogController(
	logId: string,
): Promise<LogsTypes.LogEntryResponse> {
	try {
		const log = await getLogById(logId);

		if (!log) {
			throw status(404, {
				message: "Log not found",
			});
		}

		logger.info(
			{
				logId,
				service: log.service,
				event: log.event,
			},
			"Log retrieved successfully",
		);

		return log;
	} catch (error) {
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}

		logger.error(
			{
				logId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error retrieving log",
		);

		throw status(500, {
			message:
				error instanceof Error ? error.message : "Failed to retrieve log",
		});
	}
}
