import * as z from "zod";
import { defineTool } from "../define";
import {
	inboxMessageSummarySchema,
	limitSchema,
	mailboxIdSchema,
	offsetSchema,
	toInboxMessageSummary,
} from "./schemas";

export const listInboxMessages = defineTool({
	name: "list_inbox_messages",
	title: "List received emails",
	description:
		"List emails RECEIVED in the organization's Reloop inbox mailboxes, newest first, with a preview of each. Use this when the user asks what email they got, whether something arrived, or to find a message from a sender. Filter by `mailboxId` (from list_mailboxes), `search` over subject, preview, and sender, or `spam`. Bodies are omitted; call get_inbox_message for the full email. For email the organization SENT through the API, use list_emails instead.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		mailboxId: mailboxIdSchema
			.optional()
			.describe("Only this mailbox; omit for all mailboxes"),
		search: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.optional()
			.describe("Case-insensitive search over subject, preview, and sender"),
		spam: z
			.boolean()
			.optional()
			.describe("true for only spam, false to exclude spam; omit for both"),
		limit: limitSchema,
		offset: offsetSchema,
	}),
	output: z.object({
		messages: z.array(inboxMessageSummarySchema),
		pagination: z.object({
			limit: z.number().int(),
			offset: z.number().int(),
			hasMore: z
				.boolean()
				.describe("A full page came back; request the next offset for more"),
		}),
	}),
	async run(args, api) {
		const messages = await api.inbox.listMessages({
			mailboxId: args.mailboxId,
			q: args.search,
			isSpam: args.spam,
			limit: args.limit,
			offset: args.offset,
		});
		return {
			messages: messages.map(toInboxMessageSummary),
			pagination: {
				limit: args.limit,
				offset: args.offset,
				hasMore: messages.length >= args.limit,
			},
		};
	},
});
