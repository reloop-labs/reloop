import { authMiddleware } from "@reloop/logs/middleware/auth";
import { LogsModel } from "@reloop/logs/model/logs.model";
import { Elysia } from "elysia";
import { getEngagementController } from "./get-engagement.controllers";

export const getEngagementRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/engagement",
		async ({ query, organizationId }) =>
			getEngagementController({ query, organizationId }),
		{
			auth: true,
			query: LogsModel.engagementQuery,
			response: {
				200: LogsModel.engagementResponse,
				401: LogsModel.unauthorized,
				403: LogsModel.forbidden,
				500: LogsModel.internalServerError,
			},
			detail: {
				tags: ["Logs"],
				summary: "Get engagement breakdown",
				description:
					"Who opened and clicked: email clients and providers, devices and countries of human opens and clicks, plus a day-by-hour heatmap of first opens with the busiest send time. Apple Mail Privacy Protection prefetches and security scanners are counted separately as machine opens. Filter by date range or campaign.",
			},
		},
	);
