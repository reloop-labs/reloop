import * as z from "zod";
import { defineTool } from "../define";
import { automationIdSchema } from "./schemas";

export const deleteAutomation = defineTool({
	name: "delete_automation",
	title: "Delete automation",
	description:
		"Delete an automation by ID. It stops running and contacts in progress are cancelled. This cannot be undone; prefer pause_automation when it may be needed again. Use get_automation to confirm the right automation, and confirm with the user before calling.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: automationIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.automations.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
