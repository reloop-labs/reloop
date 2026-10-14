import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { pauseAutomationXCodeSamples } from "@reloop/code-samples/workflow";
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
			404: AutomationModel.errors.notFound,
			401: AutomationModel.errors.unauthorized,
			500: AutomationModel.errors.internal,
		},
		detail: {
			tags: ["Automations"],
			summary: "Pause automation",
			description: "Stops new enrollments for this automation",
			"x-codeSamples": pauseAutomationXCodeSamples,
		},
	},
);
