import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia, t } from "elysia";
import { deleteAutomationController } from "./delete-automation.controllers";

export const deleteAutomationRoute = new Elysia().use(authMiddleware).delete(
	"/:automation_id",
	async ({ params: { automation_id }, organizationId }) => {
		return await deleteAutomationController({
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
			200: AutomationModel.deleteResponse,
			404: AutomationModel.evlogError,
			401: AutomationModel.evlogError,
			500: AutomationModel.evlogError,
		},
		detail: {
			tags: ["Automations"],
			summary: "Delete automation",
			description: "Soft-deletes an automation workflow",
		},
	},
);
