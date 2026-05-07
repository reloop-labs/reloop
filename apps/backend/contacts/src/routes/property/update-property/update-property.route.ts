import { authMiddleware } from "@be/contacts/middleware/auth";
import { PropertyModel } from "@be/contacts/model/property.model";
import { Elysia, t } from "elysia";
import { updatePropertyController } from "./update-property.controllers";
import { updatePropertyXCodeSamples } from "./update-property.x-codeSamples";

export const updatePropertyRoute = new Elysia().use(authMiddleware).patch(
	"/:contact_property_id",
	async ({
		params,
		body,
		activeOrganizationId,
		logger,
		path,
		request,
		headers,
	}) => {
		const cookieString = headers["cookie"] || "";
		return updatePropertyController({
			activeOrganizationId,
			property_id: params.contact_property_id,
			body,
			logger,
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
	},
);
