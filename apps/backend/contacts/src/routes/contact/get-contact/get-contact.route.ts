import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia, t } from "elysia";
import { getContactController } from "./get-contact.controllers";
import { getContactXCodeSamples } from "@reloop/code-samples/contacts";

export const getContactRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({ max: 60, windowSeconds: 60, namespace: "get-contact" }),
	)
	.get(
		"/retrieve/:contact_id",
		async ({ params, organizationId }) => {
			return await getContactController({
				contactId: params.contact_id,
				organizationId,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				contact_id: t.String({
					description: "Unique contact identifier",
					examples: ["cont_123456789"],
				}),
			}),
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
