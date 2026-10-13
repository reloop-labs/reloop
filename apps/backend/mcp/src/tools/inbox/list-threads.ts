import * as z from "zod";
import { defineTool } from "../define";
import {
	limitSchema,
	mailboxIdSchema,
	offsetSchema,
	threadSummarySchema,
	toThreadSummary,
} from "./schemas";

export const listInboxThreads = defineTool({
	name: "list_inbox_threads",
	title: "List inbox conversations",
	description:
		"List inbox conversations (threads of received and sent messages), most recent activity first. This is the inbox view: use `folder` for inbox, archive, or trash, `filter` for primary, alerts (important), person, or tag (labelled), and `search` over subject and preview. Call get_inbox_thread for the messages in one conversation.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		mailboxId: mailboxIdSchema
			.optional()
			.describe("Only this mailbox; omit for all"),
		folder: z
			.enum(["inbox", "archive", "trash"])
			.optional()
			.describe("Folder to list; omit for every folder"),
		filter: z
			.enum(["primary", "alerts", "person", "tag"])
			.optional()
			.describe(
				"Category: primary, alerts (important), person, or tag (has labels)",
			),
		pinned: z
			.boolean()
			.optional()
			.describe("Only pinned (true) or unpinned (false)"),
		search: z.string().trim().min(1).max(255).optional(),
		limit: limitSchema,
		offset: offsetSchema,
	}),
	output: z.object({
		threads: z.array(threadSummarySchema),
		pagination: z.object({
			limit: z.number().int(),
			offset: z.number().int(),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const threads = await api.inbox.listThreads({
			mailboxId: args.mailboxId,
			folder: args.folder,
			filter: args.filter,
			isPinned: args.pinned,
			q: args.search,
			limit: args.limit,
			offset: args.offset,
		});
		return {
			threads: threads.map(toThreadSummary),
			pagination: {
				limit: args.limit,
				offset: args.offset,
				hasMore: threads.length >= args.limit,
			},
		};
	},
});
