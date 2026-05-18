import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { ContactModel } from "@be/contacts/model/contact.model";
import { Elysia } from "elysia";
import { createContactController } from "./create-contact.controllers";
import { createContactXCodeSamples } from "./create-contact.x-codeSamples";

export const createContactRoute = new Elysia()
	.use(authMiddleware)
	.use(rateLimitPlugin({ max: 30, windowSeconds: 60, namespace: "contact-create" }))
	.post(
		"/create",
		async ({
			body,
			activeOrganizationId,
			userId,
			path,
			request,
			headers,
		}) => {
			const cookieString = headers["cookie"] || "";
			return await createContactController({
				organizationId: activeOrganizationId,
				userId,
				body,
				cookie: cookieString,
				requestDetails: {
					endpoint: path,
					method: request.method,
					userAgent: headers["user-agent"],
					ipAddress:
						(headers["x-forwarded-for"] as string) ||
						(headers["x-real-ip"] as string),
				},
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
