import * as z from "zod";
import { defineTool } from "../define";
import {
	inboxThreadIdSchema,
	threadMessageSchema,
	threadSummarySchema,
	toThreadMessage,
	toThreadSummary,
} from "./schemas";

export const getInboxThread = defineTool({
	name: "get_inbox_thread",
	title: "Get inbox conversation",
	description:
		"Get a whole inbox conversation: every received and sent message in order, with bodies and attachments. Use a received message's `messageId` from here with reply_to_inbox_message to answer it.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: inboxThreadIdSchema }),
	output: threadSummarySchema.extend({
		messages: z.array(threadMessageSchema),
	}),
	async run(args, api) {
		const thread = await api.inbox.retrieveThread(args.id);
		return {
			...toThreadSummary(thread),
			messages: thread.messages.map(toThreadMessage),
		};
	},
});
