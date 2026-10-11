import * as z from "zod";
import type { ContactProperty } from "../../reloop/types";
import { PROPERTY_KEY_PATTERN, resourceIdSchema } from "../contacts/schemas";

export const propertyIdSchema = resourceIdSchema.describe(
	"Property ID as returned by list_properties, for example prop_123456789",
);

export const propertyTypeSchema = z.enum(["string", "number"]);

export const propertyNameSchema = z
	.string()
	.trim()
	.min(1)
	.max(64)
	.regex(
		PROPERTY_KEY_PATTERN,
		"use lowercase letters, digits, and underscores, for example company_name",
	)
	.describe(
		"Property key used in contact properties and as a template variable, for example company_name",
	);

export const fallbackValueSchema = z
	.string()
	.max(2000)
	.describe(
		"Value used in emails when a contact has no value for this property",
	);

export const propertySchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string().describe("string or number"),
	fallbackValue: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toPropertyOutput(
	property: ContactProperty,
): z.output<typeof propertySchema> {
	return {
		id: property.id,
		name: property.propertyName,
		type: property.propertyType,
		fallbackValue: property.defaultValue,
		createdAt: property.createdAt,
		updatedAt: property.updatedAt,
	};
}
