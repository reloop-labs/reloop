import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { PropertyModel } from "@be/contacts/model/property.model";
import { Elysia } from "elysia";
import { listPropertiesController } from "./list-properties.controllers";
import { listPropertiesXCodeSamples } from "@reloop/code-samples/contacts";

export const listPropertiesRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 60,
			windowSeconds: 60,
			namespace: "list-properties",
		}),
	)
	.get(
		"/list",
		async ({ query, organizationId }) => {
			return listPropertiesController({
				organizationId,
				query,
			});
		},
		{
			auth: true,
			rateLimit: true,
			query: PropertyModel.propertyQuery,
			response: {
				200: PropertyModel.propertyListResponse,
				401: PropertyModel.unauthorized,
			},
			detail: {
				tags: ["Contact Properties"],
				summary: "List Contact Properties",
				description:
					"List all properties for the organization with pagination and filtering",
				"x-codeSamples": listPropertiesXCodeSamples,
			},
		},
	);
