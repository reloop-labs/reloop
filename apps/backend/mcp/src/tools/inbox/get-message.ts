import * as z from "zod";
import { defineTool } from "../define";
import {
	inboxMessageIdSchema,
	inboxMessageSchema,
	MAX_BODY_CHARS,
	toInboxMessageOutput,
} from "./schemas";

export const getInboxMessage = defineTool({
	name: "get_inbox_message",
	title: "Get received email",
	description: `Get one received email with its full body, recipients, spam score, and attachment list. The plain-text body is returned when present, otherwise the HTML; either is cut at ${MAX_BODY_CHARS} characters. Reading it does not mark it as read; use update_inbox_message for that. Use the message's threadId with get_inbox_thread to see the whole conversation.`,
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: inboxMessageIdSchema }),
	output: inboxMessageSchema,
	async run(args, api) {
		return toInboxMessageOutput(await api.inbox.retrieveMessage(args.id));
	},
});
