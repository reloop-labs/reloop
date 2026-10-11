import * as z from "zod";
import { defineTool } from "../define";
import {
	fallbackValueSchema,
	propertyIdSchema,
	propertySchema,
	toPropertyOutput,
} from "./schemas";

export const updateProperty = defineTool({
	name: "update_property",
	title: "Update contact property",
	description:
		"Change the fallback value of a contact property by ID, or clear it with null. The name and type cannot be changed; to rename, create a new property and migrate contact values with update_contact.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: propertyIdSchema,
		fallbackValue: fallbackValueSchema.nullable(),
	}),
	output: z.object({ property: propertySchema }),
	async run(args, api) {
		const property = await api.properties.setFallback(
			args.id,
			args.fallbackValue,
		);
		return { property: toPropertyOutput(property) };
	},
});
