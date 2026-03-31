import { logger } from "@reloop/logger";
import { insertLog } from "@reloop/logs/utils/clickhouse";
import { status } from "elysia";
import type { LogsTypes } from "../../../types/logs.type";

export async function createLogController(
	body: LogsTypes.CreateLogBody,
): Promise<LogsTypes.CreateLogResponse> {
	try {
		const response = await insertLog(body);

		logger.info(
			{
				service: response.service,
				event: response.event,
				level: response.level,
				uuid: response.uuid,
			},
			"Log created successfully",
		);

		return response;
	} catch (error) {
		logger.error(
			{
				service: body.service || "unknown",
				event: body.event,
				level: body.level || "info",
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating log",
		);

		throw status(500, {
			message: error instanceof Error ? error.message : "Failed to create log",
		});
	}
}
