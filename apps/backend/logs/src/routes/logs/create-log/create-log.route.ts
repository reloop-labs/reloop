import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { createLogController } from "./create-log.controllers";

export const createLogRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, userId, activeOrganizationId }) => {
		const {
			event,
			level,
			trace_id,
			metadata,
			status_code,
			requestDetails,
		} = body;
		return await createLogController({
			event,
			level,
			trace_id,
			metadata,
			status_code,
			requestDetails,
			userId: userId,
			activeOrganizationId: activeOrganizationId,
		});
	},
	{
		insertAuth: true,
		body: LogsModel.createLogBody,
		response: {
			201: LogsModel.createLogResponse,
			401: LogsModel.errorResponse,
			403: LogsModel.errorResponse,
			400: LogsModel.errorResponse,
			500: LogsModel.errorResponse,
		},
		detail: {
			tags: ["Logs"],
			summary: "Create Log",
			description: "Stores a structured log entry in ClickHouse.",
		},
	},
);
