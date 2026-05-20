import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getEmailStatsController } from "./get-email-stats.controllers";

export const getEmailStatsRoute = new Elysia().use(authMiddleware).get(
	"/emails/stats",
	async ({ query, organizationId }) => {
		return await getEmailStatsController({
			query: query as LogsModel.EmailStatsQuery,
			organizationId,
		});
	},
	{
		auth: true,
		query: LogsModel.emailStatsQuery,
		response: {
			200: LogsModel.emailStatsResponse,
			401: LogsModel.unauthorized,
			403: LogsModel.forbidden,
			500: LogsModel.internalServerError,
		},
		detail: {
			tags: ["Logs"],
			summary: "Get Email Stats",
			description: "Returns aggregated email statistics for charts.",
		},
	},
);
