import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { getAutomationController } from "./get-automation.controllers";

export const getAutomationRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/:automation_id",
		async ({ params: { automation_id }, organizationId }) => {
			return await getAutomationController({
				organizationId,
				automationId: automation_id,
			});
		},
		{
			auth: true,
			params: t.Object({
				automation_id: AutomationModel.automationIdParam,
			}),
			response: {
				200: AutomationModel.automationResponse,
				404: AutomationModel.evlogError,
				401: AutomationModel.evlogError,
			},
			detail: {
				tags: ["Automations"],
				summary: "Get automation",
				description: "Retrieves an automation workflow by ID",
			},
		},
	);
