import { authMiddleware } from "@be/contacts/middleware/auth";
import { rateLimitPlugin } from "@be/contacts/middleware/rate-limit";
import { PropertyModel } from "@be/contacts/model/property.model";
import { auditLogHook } from "@be/contacts/utils/audit-log";
import { updatePropertyXCodeSamples } from "@reloop/code-samples/contacts";
import { Elysia, t } from "elysia";
import { updatePropertyController } from "./update-property.controllers";

export const updatePropertyRoute = new Elysia()
	.use(authMiddleware)
	.use(
		rateLimitPlugin({
			max: 30,
			windowSeconds: 60,
			namespace: "update-property",
		}),
	)
	.patch(
		"/:contact_property_id",
		async ({ params, body, organizationId }) => {
			return updatePropertyController({
				organizationId,
				property_id: params.contact_property_id,
				fallbackValue: body.fallbackValue,
			});
		},
		{
			auth: true,
			rateLimit: true,
			params: t.Object({
				contact_property_id: t.String({ description: "Property ID to update" }),
			}),
			body: t.Object({
				fallbackValue: t.Nullable(
					t.String({ description: "New fallback value" }),
				),
			}),
			response: {
				200: PropertyModel.propertyResponse,
				404: PropertyModel.propertyNotFound,
				401: PropertyModel.unauthorized,
			},
			detail: {
				tags: ["Contact Properties"],
				summary: "Update Contact Property",
				description: "Update the fallback value of a property",
				"x-codeSamples": updatePropertyXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "property",
				action: "updated",
				successStatus: 200,
			}),
		},
	);
