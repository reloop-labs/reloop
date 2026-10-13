import * as z from "zod";
import { defineTool } from "../define";
import { inboxMessageIdSchema } from "./schemas";

export const updateInboxMessage = defineTool({
	name: "update_inbox_message",
	title: "Update received email",
	description:
		"Mark a received email as read or unread, star or unstar it, or flag it as spam or not spam. Only the fields you pass change. To act on a whole conversation, use update_inbox_thread.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: inboxMessageIdSchema,
			read: z
				.boolean()
				.optional()
				.describe("true to mark read, false for unread"),
			starred: z.boolean().optional(),
			spam: z
				.boolean()
				.optional()
				.describe("true to move to spam, false to restore"),
		})
		.refine(
			(value) =>
				value.read !== undefined ||
				value.starred !== undefined ||
				value.spam !== undefined,
			{ message: "Pass at least one of read, starred, or spam" },
		),
	output: z.object({ updated: z.literal(true), id: z.string() }),
	async run(args, api) {
		await api.inbox.updateMessage(args.id, {
			isRead: args.read,
			isStarred: args.starred,
			isSpam: args.spam,
		});
		return { updated: true as const, id: args.id };
	},
});
