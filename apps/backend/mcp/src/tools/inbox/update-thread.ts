import * as z from "zod";
import { defineTool } from "../define";
import { inboxThreadIdSchema } from "./schemas";

export const updateInboxThread = defineTool({
	name: "update_inbox_thread",
	title: "Update inbox conversation",
	description:
		"Mark a whole conversation read or unread, star, flag as important, pin, or close it. Only the fields you pass change. To archive, trash, or restore it, use move_inbox_thread.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: inboxThreadIdSchema,
			read: z.boolean().optional(),
			starred: z.boolean().optional(),
			important: z.boolean().optional(),
			pinned: z.boolean().optional(),
			closed: z
				.boolean()
				.optional()
				.describe("true to close the conversation, false to reopen it"),
		})
		.refine(
			({ id: _id, ...fields }) =>
				Object.values(fields).some((value) => value !== undefined),
			{ message: "Pass at least one field to change" },
		),
	output: z.object({ updated: z.literal(true), id: z.string() }),
	async run(args, api) {
		await api.inbox.updateThread(args.id, {
			isRead: args.read,
			isStarred: args.starred,
			isImportant: args.important,
			isPinned: args.pinned,
			status:
				args.closed === undefined
					? undefined
					: args.closed
						? "closed"
						: "active",
		});
		return { updated: true as const, id: args.id };
	},
});
