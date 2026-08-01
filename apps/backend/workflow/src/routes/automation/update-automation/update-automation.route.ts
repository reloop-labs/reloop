import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import type { AutomationGraph } from "@reloop/db/schema";
import { Elysia, t } from "elysia";
import { updateAutomationController } from "./update-automation.controllers";

export const updateAutomationRoute = new Elysia().use(authMiddleware).patch(
	"/:automation_id",
	async ({ params: { automation_id }, body, organizationId }) => {
		return await updateAutomationController({
			organizationId,
			automationId: automation_id,
			name: body.name,
			description: body.description,
			graph: body.graph as AutomationGraph | undefined,
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
			400: AutomationModel.evlogError,
			404: AutomationModel.evlogError,
			401: AutomationModel.evlogError,
			500: AutomationModel.evlogError,
		},
		detail: {
			tags: ["Automations"],
			summary: "Update automation",
			description: "Updates automation name, description, or draft graph",
		},
	},
);
