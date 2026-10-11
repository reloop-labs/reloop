import * as z from "zod";
import { defineTool } from "../define";
import { propertyIdSchema } from "./schemas";

export const deleteProperty = defineTool({
	name: "delete_property",
	title: "Delete contact property",
	description:
		"Delete a contact property definition by ID. Use list_properties to confirm the right property first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: propertyIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.properties.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
