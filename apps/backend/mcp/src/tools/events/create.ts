import * as z from "zod";
import { defineTool } from "../define";
import {
	eventKeySchema,
	eventPropertyInputSchema,
	eventSchema,
	toEventOutput,
} from "./schemas";

export const createEvent = defineTool({
	name: "create_event",
	title: "Create event",
	description:
		"Create a custom event that the app can track to start automations, with the properties it carries (for example a plan on a sign-up). The key is made from the name when left out and always starts with trigger.; use the returned `key` in an automation's trigger step. Fails with `event_already_exists` when the key is taken; check list_events first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		name: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.describe("Display name, for example User signed up"),
		key: eventKeySchema.optional(),
		description: z.string().max(2000).optional(),
		properties: z.array(eventPropertyInputSchema).max(50).optional(),
	}),
	output: z.object({ event: eventSchema }),
	async run(args, api) {
		return { event: toEventOutput(await api.workflowEvents.create(args)) };
	},
});
