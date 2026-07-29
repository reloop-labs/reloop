import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { listLogsController } from "./list-logs.controllers";
import { listLogsXCodeSamples } from "@reloop/code-samples/logs";

export const listLogsRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, organizationId }) => {
		return await listLogsController(query, organizationId);
	},
	{
		auth: true,
		query: LogsModel.listLogsQuery,
		response: {
			200: LogsModel.listLogsResponse,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "List Logs",
			description:
				"Returns log entries with optional filtering. Currently limited to email-related activity (service email/mail or resource_type email).",
			"x-codeSamples": listLogsXCodeSamples,
		},
	},
);
