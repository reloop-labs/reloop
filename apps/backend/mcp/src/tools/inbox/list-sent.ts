import * as z from "zod";
import { defineTool } from "../define";
import {
	mailboxIdSchema,
	sentMessageSchema,
	toSentMessageOutput,
} from "./schemas";

export const listMailboxSentMessages = defineTool({
	name: "list_mailbox_sent_messages",
	title: "List mailbox sent emails",
	description:
		"List emails sent FROM inbox mailboxes (replies, forwards, and send_mailbox_email), newest first, with delivery status. Filter by `mailboxId` or `search` over subject, body, and recipients. For transactional email sent through the API, use list_emails instead.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		mailboxId: mailboxIdSchema.optional(),
		search: z.string().trim().min(1).max(255).optional(),
	}),
	output: z.object({ messages: z.array(sentMessageSchema) }),
	async run(args, api) {
		const messages = await api.inbox.listSentMessages({
			mailboxId: args.mailboxId,
			q: args.search,
		});
		return { messages: messages.map(toSentMessageOutput) };
	},
});
