import * as z from "zod";
import { defineTool } from "../define";
import { inboxThreadIdSchema } from "./schemas";

export const moveInboxThread = defineTool({
	name: "move_inbox_thread",
	title: "Archive, trash, or restore conversation",
	description:
		"Move a conversation out of or back into the inbox: `archive` hides it from the inbox, `trash` moves it to trash, and `restore` brings an archived or trashed conversation back. Nothing is deleted; use delete_inbox_thread to remove it permanently.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: inboxThreadIdSchema,
		action: z.enum(["archive", "trash", "restore"]),
	}),
	output: z.object({
		id: z.string(),
		action: z.enum(["archive", "trash", "restore"]),
		done: z.literal(true),
	}),
	async run(args, api) {
		await api.inbox.moveThread(args.id, args.action);
		return { id: args.id, action: args.action, done: true as const };
	},
});
