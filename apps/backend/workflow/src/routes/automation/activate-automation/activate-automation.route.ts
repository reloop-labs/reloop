import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { activateAutomationXCodeSamples } from "@reloop/code-samples/workflow";
import { Elysia, t } from "elysia";
import { activateAutomationController } from "./activate-automation.controllers";

export const activateAutomationRoute = new Elysia().use(authMiddleware).post(
	"/:automation_id/activate",
	async ({ params: { automation_id }, organizationId, userId }) => {
		return await activateAutomationController({
			organizationId,
			userId,
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
			400: AutomationModel.errors.cannotActivate,
			404: AutomationModel.errors.notFound,
			401: AutomationModel.errors.unauthorized,
			500: AutomationModel.errors.internal,
		},
		detail: {
			tags: ["Automations"],
			summary: "Activate automation",
			description:
				"Publishes an immutable version snapshot and starts enrolling contacts on the trigger",
			"x-codeSamples": activateAutomationXCodeSamples,
		},
	},
);
