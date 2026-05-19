import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { removeContactFromGroupController } from "./remove-contact-from-group.controllers";
import { removeContactFromGroupXCodeSamples } from "./remove-contact-from-group.x-codeSamples";

export const removeContactFromGroupRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "remove-group" }),
	)
	.delete(
		"/group/:group_id",
		async ({ body, params, organizationId }) => {
			return await removeContactFromGroupController({
				organizationId,
				groupId: params.group_id,
				contact_id: body.contact_id,
				email: body.email,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({ group_id: t.String() }),
			body: ContactModel.removeContactFromGroupBody,
			response: {
				200: ContactModel.removeContactFromGroupResponse,
				400: t.Object({ message: t.String() }),
				404: t.Object({ message: t.String() }),
			},
			detail: {
				tags: ["Contact"],
				summary: "Delete Contact Group",
				description: "Deletes a contact from a group by ID or email",
				"x-codeSamples": removeContactFromGroupXCodeSamples,
			},
		},
	);
