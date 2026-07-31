import { authMiddleware } from "@be/workflow/middleware/auth";
import { CustomEventModel } from "@be/workflow/routes/custom-event/custom-event.model";
import { Elysia, t } from "elysia";
import { updateCustomEventController } from "./update-custom-event.controllers";

export const updateCustomEventRoute = new Elysia()
	.use(authMiddleware)
	.patch(
		"/:event_id",
		async ({ params: { event_id }, body, organizationId }) => {
			return await updateCustomEventController({
				organizationId,
				eventId: event_id,
				name: body.name,
				description: body.description,
				properties: body.properties,
			});
		},
		{
			auth: true,
			params: t.Object({
				event_id: t.String({ minLength: 1 }),
			}),
			body: CustomEventModel.updateBody,
			response: {
				200: CustomEventModel.eventResponse,
				400: CustomEventModel.evlogError,
				404: CustomEventModel.evlogError,
				401: CustomEventModel.evlogError,
				500: CustomEventModel.evlogError,
			},
			detail: {
				tags: ["Events"],
				summary: "Update custom event",
				description:
					"Updates name/description and optionally replaces the property schema",
			},
		},
	);
