import * as z from "zod";
import { defineTool } from "../define";
import { eventSchema, toEventOutput } from "./schemas";

export const getEvent = defineTool({
	name: "get_event",
	title: "Get event",
	description:
		"Get one custom event by its ID or its key (for example user.signed_up), with the properties it accepts.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		idOrKey: z
			.string()
			.trim()
			.min(1)
			.max(128)
			.describe("Event ID (evt_...) or key (user.signed_up)"),
	}),
	output: z.object({ event: eventSchema }),
	async run(args, api) {
		return {
			event: toEventOutput(await api.workflowEvents.retrieve(args.idOrKey)),
		};
	},
});
