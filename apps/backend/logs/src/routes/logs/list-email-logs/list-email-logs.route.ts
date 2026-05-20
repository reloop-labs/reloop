import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { listEmailLogsController } from "./list-email-logs.controllers";

export const listEmailLogsRoute = new Elysia().use(authMiddleware).get(
	"/emails",
	async ({ query, activeOrganizationId }) => {
		const result = await listEmailLogsController({
			query,
			organizationId: activeOrganizationId,
		});
		return result;
	},
	{
		auth: true,
		query: LogsModel.listEmailLogsQuery,
		response: {
			200: LogsModel.listEmailLogsResponse,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "List Email Logs",
			description: "Returns email logs for the active organization.",
		},
	},
);
