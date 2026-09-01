import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { listEnrollmentsController } from "./list-enrollments.controllers";

export const listEnrollmentsRoute = new Elysia().use(authMiddleware).get(
	"/:automation_id/enrollments",
	async ({ params: { automation_id }, query, organizationId }) => {
		return await listEnrollmentsController({
			organizationId,
			automationId: automation_id,
			page: Number(query.page ?? 1),
			limit: Number(query.limit ?? 50),
			status: query.status,
		});
	},
	{
		auth: true,
		params: t.Object({
			automation_id: AutomationModel.automationIdParam,
		}),
		query: AutomationModel.enrollmentListQuery,
		response: {
			200: AutomationModel.enrollmentListResponse,
			401: AutomationModel.evlogError,
			404: AutomationModel.evlogError,
		},
		detail: {
			tags: ["Automations"],
			summary: "List enrollments",
			description: "Lists contacts enrolled in this automation",
		},
	},
);
