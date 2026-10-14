import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { updateAutomationXCodeSamples } from "@reloop/code-samples/workflow";
import type { AutomationGraph } from "@reloop/db/schema";
import { Elysia, t } from "elysia";
import { updateAutomationController } from "./update-automation.controllers";

export const updateAutomationRoute = new Elysia().use(authMiddleware).patch(
	"/:automation_id",
	async ({ params: { automation_id }, body, organizationId, userId }) => {
		return await updateAutomationController({
			organizationId,
			userId,
			automationId: automation_id,
			name: body.name,
			description: body.description,
			graph: body.graph as AutomationGraph | undefined,
			steps: body.steps,
			connections: body.connections,
			status: body.status,
		});
	},
	{
		auth: true,
		params: t.Object({
			automation_id: AutomationModel.automationIdParam,
		}),
		body: AutomationModel.updateBody,
		response: {
			200: AutomationModel.automationResponse,
			400: AutomationModel.errors.invalidGraph,
			404: AutomationModel.errors.notFound,
			401: AutomationModel.errors.unauthorized,
			500: AutomationModel.errors.internal,
		},
		detail: {
			tags: ["Automations"],
			summary: "Update automation",
			description: "Updates automation name, description, or draft graph",
			"x-codeSamples": updateAutomationXCodeSamples,
		},
	},
);
