import { authMiddleware } from "@be/workflow/middleware/auth";
import { CustomEventModel } from "@be/workflow/routes/custom-event/custom-event.model";
import { Elysia, t } from "elysia";
import { getCustomEventController } from "./get-custom-event.controllers";

export const getCustomEventRoute = new Elysia().use(authMiddleware).get(
	"/:event_id",
	async ({ params: { event_id }, organizationId }) => {
		return await getCustomEventController({
			organizationId,
			eventIdOrKey: event_id,
		});
	},
	{
		auth: true,
		params: t.Object({
			event_id: t.String({ minLength: 1 }),
		}),
		response: {
			200: CustomEventModel.eventResponse,
			404: CustomEventModel.evlogError,
			401: CustomEventModel.evlogError,
		},
		detail: {
			tags: ["Events"],
			summary: "Get custom event",
			description: "Retrieves an event by ID or key, including properties",
		},
	},
);
