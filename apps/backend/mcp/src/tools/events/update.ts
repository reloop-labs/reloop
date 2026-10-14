import * as z from "zod";
import { defineTool } from "../define";
import {
	eventIdSchema,
	eventPropertyInputSchema,
	eventSchema,
	toEventOutput,
} from "./schemas";

export const updateEvent = defineTool({
	name: "update_event",
	title: "Update event",
	description:
		"Rename a custom event, change its description, or replace its properties. `properties` replaces the whole list: read the current ones with get_event and pass the full updated list. The key cannot change.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: eventIdSchema,
			name: z.string().trim().min(1).max(255).optional(),
			description: z
				.string()
				.max(2000)
				.nullable()
				.optional()
				.describe("New description, or null to clear it"),
			properties: z
				.array(eventPropertyInputSchema)
				.max(50)
				.optional()
				.describe("Replaces every property"),
		})
		.refine(
			(value) =>
				value.name !== undefined ||
				value.description !== undefined ||
				value.properties !== undefined,
			{ message: "Pass at least one of name, description or properties" },
		),
	output: z.object({ event: eventSchema }),
	async run(args, api) {
		const { id, ...body } = args;
		return { event: toEventOutput(await api.workflowEvents.update(id, body)) };
	},
});
