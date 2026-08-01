import { authMiddleware } from "@be/workflow/middleware/auth";
import { CustomEventModel } from "@be/workflow/routes/custom-event/custom-event.model";
import { Elysia } from "elysia";
import { listCustomEventsController } from "./list-custom-events.controllers";

export const listCustomEventsRoute = new Elysia().use(authMiddleware).get(
	"/",
	async ({ query, organizationId }) => {
		return await listCustomEventsController({
			organizationId,
			page: Number(query.page ?? 1),
			limit: Number(query.limit ?? 50),
		});
	},
	{
		auth: true,
		query: CustomEventModel.listQuery,
		response: {
			200: CustomEventModel.eventListResponse,
			401: CustomEventModel.evlogError,
		},
		detail: {
			tags: ["Events"],
			summary: "List custom events",
			description: "Lists org-defined events and their property schemas",
		},
	},
);
