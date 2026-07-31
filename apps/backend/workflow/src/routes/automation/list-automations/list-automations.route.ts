import { authMiddleware } from "@be/workflow/middleware/auth";
import { AutomationModel } from "@be/workflow/routes/automation/automation.model";
import { Elysia } from "elysia";
import { listAutomationsController } from "./list-automations.controllers";

export const listAutomationsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/",
		async ({ query, organizationId }) => {
			return await listAutomationsController({
				organizationId,
				page: Number(query.page ?? 1),
				limit: Number(query.limit ?? 50),
			});
		},
		{
			auth: true,
			query: AutomationModel.listQuery,
			response: {
				200: AutomationModel.automationListResponse,
				401: AutomationModel.evlogError,
			},
			detail: {
				tags: ["Automations"],
				summary: "List automations",
				description: "Lists automation workflows for the active organization",
			},
		},
	);
