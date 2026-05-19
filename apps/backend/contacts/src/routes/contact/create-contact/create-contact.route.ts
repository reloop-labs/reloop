import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia } from "elysia";
import { createContactController } from "./create-contact.controllers";
import { createContactXCodeSamples } from "./create-contact.x-codeSamples";

export const createContactRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "contact-create",
		}),
	)
	.post(
		"/create",
		async ({ body, organizationId, userId }) => {
			return await createContactController({
				organizationId,
				userId,
				email: body.email,
				firstName: body.firstName,
				lastName: body.lastName,
				status: body.status,
				properties: body.properties,
				groupIds: body.groupIds,
				channels: body.channels,
			});
		},
		{
			auth: true,
			rateLimit: true,
			body: ContactModel.createContactBody,
			response: {
				201: ContactModel.contactResponse,
				409: ContactModel.contactAlreadyExists,
				400: ContactModel.invalidEmail,
				403: ContactModel.unauthorized,
			},
			detail: {
				tags: ["Contact"],
				summary: "Create Contact",
				description: "Creates contact",
				"x-codeSamples": createContactXCodeSamples,
			},
		},
	);
