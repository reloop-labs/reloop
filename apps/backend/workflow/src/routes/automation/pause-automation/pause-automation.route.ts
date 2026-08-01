import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { pauseAutomationController } from "./pause-automation.controllers";

export const pauseAutomationRoute = new Elysia().use(authMiddleware).post(
	"/:automation_id/pause",
	async ({ params: { automation_id }, organizationId }) => {
		return await pauseAutomationController({
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
			500: AutomationModel.evlogError,
		},
		detail: {
			tags: ["Automations"],
			summary: "Pause automation",
			description: "Stops new enrollments for this automation",
		},
	},
);
