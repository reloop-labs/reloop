import * as z from "zod";
import { defineTool } from "../define";
import {
	fallbackValueSchema,
	propertyNameSchema,
	propertySchema,
	propertyTypeSchema,
	toPropertyOutput,
} from "./schemas";

export const createProperty = defineTool({
	name: "create_property",
	title: "Create contact property",
	description:
		"Define a new custom contact property, such as company_name or plan_seats. Contacts can then store a value for it under that key in `properties`. Fails with `property_already_exists` when the name is taken; use list_properties first when unsure.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		name: propertyNameSchema,
		type: propertyTypeSchema.describe("string or number"),
		fallbackValue: fallbackValueSchema.optional(),
	}),
	output: z.object({ property: propertySchema }),
	async run(args, api) {
		const property = await api.properties.create({
			name: args.name,
			type: args.type,
			fallbackValue: args.fallbackValue,
		});
		return { property: toPropertyOutput(property) };
	},
});
