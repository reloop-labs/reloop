import * as z from "zod";
import { defineTool } from "../define";
import {
	attachmentsInputSchema,
	bodyHtmlSchema,
	bodyTextSchema,
	inboxMessageIdSchema,
	recipientsInputSchema,
	sendResultSchema,
	toAttachmentInputs,
	toSendResult,
} from "./schemas";

export const replyToInboxMessage = defineTool({
	name: "reply_to_inbox_message",
	title: "Reply to received email",
	description:
		"Reply to a received email from the mailbox that received it, keeping the subject and conversation thread. By default it replies to the sender only; set `replyAll` to include everyone on the original To and Cc. This sends real email immediately and cannot be recalled, so show the user the reply text and recipients before calling.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z
		.object({
			id: inboxMessageIdSchema.describe("Received message to reply to"),
			text: bodyTextSchema,
			html: bodyHtmlSchema,
			replyAll: z
				.boolean()
				.default(false)
				.describe("Also reply to the original To and Cc recipients"),
			to: recipientsInputSchema
				.optional()
				.describe("Override who the reply goes to"),
			cc: recipientsInputSchema.optional(),
			bcc: recipientsInputSchema.optional(),
			attachments: attachmentsInputSchema,
		})
		.refine((value) => value.text !== undefined || value.html !== undefined, {
			message: "Provide text or html",
		}),
	output: sendResultSchema,
	async run(args, api) {
		return toSendResult(
			await api.inbox.reply(
				args.id,
				{
					text: args.text,
					html: args.html,
					to: args.to,
					cc: args.cc,
					bcc: args.bcc,
					attachments: toAttachmentInputs(args.attachments),
				},
				{ all: args.replyAll },
			),
		);
	},
});
