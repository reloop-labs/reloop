import { authMiddleware } from "@be/workflow/middleware/auth";
import { CustomEventModel } from "@be/workflow/routes/custom-event/custom-event.model";
import { Elysia } from "elysia";
import { trackCustomEventController } from "./track-custom-event.controllers";

export const trackCustomEventRoute = new Elysia()
	.use(authMiddleware)
	.post(
		"/track",
		async ({ body, organizationId, userId }) => {
			return await trackCustomEventController({
				organizationId,
				userId,
				eventKey: body.event,
				contactId: body.contactId,
				email: body.email,
				properties: body.properties as Record<string, unknown> | undefined,
			});
		},
		{
			auth: true,
			body: CustomEventModel.trackBody,
			response: {
				200: CustomEventModel.trackResponse,
				400: CustomEventModel.evlogError,
				404: CustomEventModel.evlogError,
				401: CustomEventModel.evlogError,
			},
			detail: {
				tags: ["Events"],
				summary: "Track workflow event",
				description:
					"Fires a workflow-only custom event: validates properties and enrolls matching automations. Not related to outbound webhooks.",
			},
		},
	);
