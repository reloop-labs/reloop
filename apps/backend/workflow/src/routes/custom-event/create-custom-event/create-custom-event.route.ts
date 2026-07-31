import { authMiddleware } from "@be/workflow/middleware/auth";
import { CustomEventModel } from "@be/workflow/routes/custom-event/custom-event.model";
import { Elysia } from "elysia";
import { createCustomEventController } from "./create-custom-event.controllers";

export const createCustomEventRoute = new Elysia()
	.use(authMiddleware)
	.post(
		"/",
		async ({ body, organizationId, userId, set }) => {
			const result = await createCustomEventController({
				organizationId,
				userId,
				name: body.name,
				key: body.key,
				description: body.description,
				properties: body.properties,
			});
			set.status = 201;
			return result;
		},
		{
			auth: true,
			body: CustomEventModel.createBody,
			response: {
				201: CustomEventModel.eventResponse,
				400: CustomEventModel.evlogError,
				409: CustomEventModel.evlogError,
				401: CustomEventModel.evlogError,
				500: CustomEventModel.evlogError,
			},
			detail: {
				tags: ["Events"],
				summary: "Create workflow event",
				description:
					"Creates an org-defined workflow event with optional property schema. Used only as automation triggers — not webhooks.",
			},
		},
	);
