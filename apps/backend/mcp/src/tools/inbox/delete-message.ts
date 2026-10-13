import * as z from "zod";
import { defineTool } from "../define";
import { inboxMessageIdSchema } from "./schemas";

export const deleteInboxMessage = defineTool({
	name: "delete_inbox_message",
	title: "Delete received email",
	description:
		"Permanently delete one received email and its attachments. This cannot be undone. To keep it but hide it from the inbox, prefer move_inbox_thread with `archive` or `trash` on its thread. Confirm with the user before calling.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: inboxMessageIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		await api.inbox.removeMessage(args.id);
		return { deleted: true as const, id: args.id };
	},
});
