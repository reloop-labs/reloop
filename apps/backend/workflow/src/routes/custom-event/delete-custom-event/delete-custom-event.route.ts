import { authMiddleware } from "@be/workflow/middleware/auth";
import { CustomEventModel } from "@be/workflow/routes/custom-event/custom-event.model";
import { Elysia, t } from "elysia";
import { deleteCustomEventController } from "./delete-custom-event.controllers";

export const deleteCustomEventRoute = new Elysia()
	.use(authMiddleware)
	.delete(
		"/:event_id",
		async ({ params: { event_id }, organizationId }) => {
			return await deleteCustomEventController({
				organizationId,
				eventId: event_id,
			});
		},
		{
			auth: true,
			params: t.Object({
				event_id: t.String({ minLength: 1 }),
			}),
			response: {
				200: CustomEventModel.deleteResponse,
				404: CustomEventModel.evlogError,
				401: CustomEventModel.evlogError,
			},
			detail: {
				tags: ["Events"],
				summary: "Delete custom event",
				description: "Soft-deletes a custom event definition",
			},
		},
	);
