import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { getOverviewAnalyticsController } from "./overview-analytics.controllers";
import { getOverviewController } from "./overview.controllers";

export const overviewRoute = new Elysia()
	.use(authMiddleware)
	.get("/overview", async () => getOverviewController(), {
		authAdmin: true,
		response: {
			200: AdminModel.overviewResponse,
			401: AdminModel.unauthorized,
		},
		detail: {
			tags: ["Admin"],
			summary: "Platform overview KPIs",
		},
	})
	.get(
		"/overview/analytics",
		async ({ query }) => getOverviewAnalyticsController(query.range ?? "30d"),
		{
			authAdmin: true,
			query: t.Object({
				range: t.Optional(
					t.Union([t.Literal("7d"), t.Literal("30d"), t.Literal("90d")]),
				),
			}),
			response: {
				200: AdminModel.overviewAnalyticsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary:
					"Platform analytics: daily email outcomes, growth, domain status and top senders",
			},
		},
	);
