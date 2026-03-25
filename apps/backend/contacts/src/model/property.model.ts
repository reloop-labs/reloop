import { t } from "elysia";

export namespace PropertyModel {
	// Property type values
	export const typeValues = ["string", "number"] as const;

	// Property Models
	export const createPropertyBody = t.Object({
		name: t.String({
			minLength: 1,
			maxLength: 255,
			description: "Property name (e.g., company_name, first_name)",
		}),
		type: t.Union([t.Literal("string"), t.Literal("number")], {
			description: "Property type",
		}),
		fallbackValue: t.Optional(
			t.String({
				description: "Default value to use when property is empty",
			}),
		),
	});

	export type CreatePropertyBody = typeof createPropertyBody.static;

	export const updatePropertyBody = t.Object({
		name: t.Optional(
			t.String({
				minLength: 1,
				maxLength: 255,
				description: "Property name",
			}),
		),
		type: t.Optional(
			t.Union([t.Literal("string"), t.Literal("number")], {
				description: "Property type",
			}),
		),
		fallbackValue: t.Optional(
			t.String({
				description: "Default value to use when property is empty",
			}),
		),
	});

	export type UpdatePropertyBody = typeof updatePropertyBody.static;

	export const propertyResponse = t.Object({
		object: t.Literal("contact_property", { default: "contact_property" }),
		id: t.String({ description: "Unique property identifier" }),
		name: t.String({ description: "Property name" }),
		type: t.String({ description: "Property type (string or number)" }),
		fallbackValue: t.Union([t.String(), t.Null()], {
			description: "Fallback value",
		}),
		createdAt: t.Date(),
		updatedAt: t.Date(),
	});

	export type PropertyResponse = typeof propertyResponse.static;

	export const propertyListItem = t.Omit(propertyResponse, ["object"]);
	export type PropertyListItem = typeof propertyListItem.static;

	export const propertyListResponse = t.Object({
		object: t.Literal("contact_property", { default: "contact_property" }),
		properties: t.Array(propertyListItem),
		total: t.Number(),
		page: t.Number(),
		limit: t.Number(),
	});

	export type PropertyListResponse = typeof propertyListResponse.static;

	export const propertyQuery = t.Object({
		page: t.Optional(t.Number({ minimum: 1, default: 1 })),
		limit: t.Optional(t.Number({ minimum: 1, maximum: 100, default: 10 })),
		search: t.Optional(t.String({ description: "Search by name" })),
		type: t.Optional(
			t.Union([t.Literal("string"), t.Literal("number")], {
				description: "Filter by type",
			}),
		),
		organizationId: t.Optional(t.String()),
	});

	export type PropertyQuery = typeof propertyQuery.static;

	// Delete Response
	export const deleteResponse = t.Object({
		object: t.Literal("contact_property", { default: "contact_property" }),
		success: t.Boolean(),
	});

	export type DeleteResponse = typeof deleteResponse.static;

	// Error Responses
	export const propertyNotFound = t.Object({
		message: t.Literal("Property not found"),
	});
	export type PropertyNotFound = typeof propertyNotFound.static;

	export const propertyAlreadyExists = t.Object({
		message: t.Literal("Property already exists"),
	});
	export type PropertyAlreadyExists = typeof propertyAlreadyExists.static;

	export const unauthorized = t.Object({
		message: t.Literal("Unauthorized access"),
	});
	export type Unauthorized = typeof unauthorized.static;

	export const validationError = t.Object({
		message: t.String(),
		errors: t.Array(
			t.Object({
				field: t.String(),
				message: t.String(),
			}),
		),
	});
	export type ValidationError = typeof validationError.static;
}
