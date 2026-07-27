import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { PropertyModel } from "@be/contacts/model/property.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { Elysia } from "elysia";
import { createPropertyController } from "./create-property.controllers";
import { createPropertyXCodeSamples } from "@reloop/code-samples/contacts";

export const createPropertyRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "create-property",
		}),
	)
	.post(
		"/create",
		async ({ body, organizationId, userId }) => {
			return createPropertyController({
				organizationId,
				userId,
				name: body.name,
				type: body.type,
				fallbackValue: body.fallbackValue,
			});
		},
		{
			auth: true,
			rateLimit: true,
			body: PropertyModel.createPropertyBody,
			response: {
				200: PropertyModel.propertyResponse,
				409: PropertyModel.propertyAlreadyExists,
				401: PropertyModel.unauthorized,
			},
			detail: {
				tags: ["Contact Properties"],
				summary: "Create Contact Property",
				description:
					"Create a new custom property for contacts in the organization",
				"x-codeSamples": createPropertyXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "property",
				action: "created",
				successStatus: 200,
			}),
		},
	);
