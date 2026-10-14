import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { deleteAutomationXCodeSamples } from "@reloop/code-samples/workflow";
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
			404: AutomationModel.errors.notFound,
			401: AutomationModel.errors.unauthorized,
			500: AutomationModel.errors.internal,
		},
		detail: {
			tags: ["Automations"],
			summary: "Delete automation",
			description: "Soft-deletes an automation workflow",
			"x-codeSamples": deleteAutomationXCodeSamples,
		},
	},
);
