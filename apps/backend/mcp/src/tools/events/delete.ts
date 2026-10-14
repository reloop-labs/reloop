import * as z from "zod";
import { defineTool } from "../define";
import { eventIdSchema } from "./schemas";

export const deleteEvent = defineTool({
	name: "delete_event",
	title: "Delete event",
	description:
		"Delete a custom event by ID. Tracking it fails from then on, and automations it triggers can no longer be activated. Use get_event to confirm the right event, and confirm with the user before calling.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: eventIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.workflowEvents.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
