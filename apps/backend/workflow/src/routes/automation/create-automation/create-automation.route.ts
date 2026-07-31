import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia } from "elysia";
import { createAutomationController } from "./create-automation.controllers";

export const createAutomationRoute = new Elysia()
	.use(authMiddleware)
	.post(
		"/",
		async ({ body, organizationId, userId, set }) => {
			const result = await createAutomationController({
				organizationId,
				userId,
				name: body.name,
				description: body.description,
			});
			set.status = 201;
			return result;
		},
		{
			auth: true,
			body: AutomationModel.createBody,
			response: {
				201: AutomationModel.automationResponse,
				400: AutomationModel.evlogError,
				401: AutomationModel.evlogError,
				500: AutomationModel.evlogError,
			},
			detail: {
				tags: ["Automations"],
				summary: "Create automation",
				description: "Creates a draft automation workflow for the organization",
			},
		},
	);
