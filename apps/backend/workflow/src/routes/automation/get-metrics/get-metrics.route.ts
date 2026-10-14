import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { getMetricsController } from "./get-metrics.controllers";

export const getMetricsRoute = new Elysia().use(authMiddleware).get(
	"/:automation_id/metrics",
	async ({ params: { automation_id }, query, organizationId }) => {
		return await getMetricsController({
			organizationId,
			automationId: automation_id,
			days: query.days ?? 30,
		});
	},
	{
		auth: true,
		params: t.Object({
			automation_id: AutomationModel.automationIdParam,
		}),
		query: AutomationModel.metricsQuery,
		response: {
			200: AutomationModel.metricsResponse,
			401: AutomationModel.errors.unauthorized,
			404: AutomationModel.errors.notFound,
		},
		detail: {
			tags: ["Automations"],
			summary: "Get automation metrics",
			description:
				"Runs by status, emails sent and opened, what happened at each step, and runs started per day",
		},
	},
);
