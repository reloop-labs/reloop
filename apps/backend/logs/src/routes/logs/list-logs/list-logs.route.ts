import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { listLogsController } from "./list-logs.controllers";
import { listLogsXCodeSamples } from "./list-logs.x-codeSamples";

export const listLogsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query }) => {
		return await listLogsController(query);
	},
	{
		auth: true,
		query: LogsModel.listLogsQuery,
		response: {
			200: LogsModel.listLogsResponse,
			401: LogsModel.errorResponse,
			403: LogsModel.errorResponse,
			500: LogsModel.errorResponse,
		},
		detail: {
			tags: ["Logs"],
			summary: "List Logs",
			description: "Returns log entries with optional filtering.",
			"x-codeSamples": listLogsXCodeSamples,
		},
	},
);
