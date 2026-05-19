import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { PropertyModel } from "@be/contacts/model/property.model";
import { Elysia, t } from "elysia";
import { deletePropertyController } from "./delete-property.controllers";
import { deletePropertyXCodeSamples } from "./delete-property.x-codeSamples";

export const deletePropertyRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "delete-property",
		}),
	)
	.delete(
		"/:contact_property_id",
		async ({ params, organizationId, logger }) => {
			return deletePropertyController({
				organizationId,
				property_id: params.contact_property_id,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				contact_property_id: t.String({ description: "Property ID to delete" }),
			}),
			response: {
				200: PropertyModel.deleteResponse,
				404: PropertyModel.propertyNotFound,
				401: PropertyModel.unauthorized,
			},
			detail: {
				tags: ["Contact Properties"],
				summary: "Delete Contact Property",
				description: "Soft delete a property by ID",
				"x-codeSamples": deletePropertyXCodeSamples,
			},
		},
	);
