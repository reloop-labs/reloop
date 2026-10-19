import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { createAutomationXCodeSamples } from "@reloop/code-samples/workflow";
import { Elysia } from "elysia";
import { createAutomationController } from "./create-automation.controllers";

export const createAutomationRoute = new Elysia().use(authMiddleware).post(
	"/",
	async ({ body, organizationId, userId, set }) => {
		const result = await createAutomationController({
			organizationId,
			userId,
			name: body.name,
			description: body.description,
			status: body.status,
			steps: body.steps,
			connections: body.connections,
			reentry: body.reentry,
		});
		set.status = 201;
		return result;
	},
	{
		auth: true,
		body: AutomationModel.createBody,
		response: {
			201: AutomationModel.automationResponse,
			400: AutomationModel.errors.invalidGraph,
			401: AutomationModel.errors.unauthorized,
			500: AutomationModel.errors.internal,
		},
		detail: {
			tags: ["Automations"],
			summary: "Create automation",
			description:
				'Creates an automation from `steps` and the `connections` between them. It starts as a draft unless `status` is "active", which validates it and starts it right away.',
			"x-codeSamples": createAutomationXCodeSamples,
		},
	},
);
