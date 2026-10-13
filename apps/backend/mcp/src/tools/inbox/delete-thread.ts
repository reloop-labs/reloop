import * as z from "zod";
import { defineTool } from "../define";
import { inboxThreadIdSchema } from "./schemas";

export const deleteInboxThread = defineTool({
	name: "delete_inbox_thread",
	title: "Delete inbox conversation",
	description:
		"Permanently delete a conversation and every message in it. This cannot be undone; prefer move_inbox_thread with `trash` unless the user explicitly asks to delete it forever. Confirm with the user before calling.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: inboxThreadIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		await api.inbox.removeThread(args.id);
		return { deleted: true as const, id: args.id };
	},
});
