import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { getContactController } from "./get-contact.controllers";
import { getContactXCodeSamples } from "./get-contact.x-codeSamples";

export const getContactRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 60, windowSeconds: 60, namespace: "get-contact" }),
	)
	.get(
		"/retrieve/:contact_id",
		async ({ params, activeOrganizationId, logger }) => {
			return await getContactController({
				contactId: params.contact_id,
				organizationId: activeOrganizationId,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({ contact_id: t.String() }),
			response: {
				200: ContactModel.contactBaseResponse,
				404: ContactModel.contactNotFound,
				403: ContactModel.unauthorized,
			},
			detail: {
				tags: ["Contact"],
				summary: "Retrieve Contact",
				description: "Retrieves a contact by ID",
				"x-codeSamples": getContactXCodeSamples,
			},
		},
	);
