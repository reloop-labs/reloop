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

		return log;
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
