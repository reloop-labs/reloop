import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { createContactXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia } from "elysia";
import { createContactController } from "./create-contact.controllers";

export const createContactRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 200,
			windowSeconds: 60,
			namespace: "contact-create",
		}),
	)
	.post(
		"/create",
		async ({ body, organizationId, userId }) => {
			const {
				email,
				firstName,
				lastName,
				status,
				properties,
				groupIds,
				channels,
			} = body;
			return await createContactController({
				organizationId,
				userId,
				email,
				firstName,
				lastName,
				status,
				properties,
				groupIds,
				channels,
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
			afterResponse: auditLogHook({
				resourceType: "contact",
				action: "created",
				successStatus: 201,
			}),
		},
	);
