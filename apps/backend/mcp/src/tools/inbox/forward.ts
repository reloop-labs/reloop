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

export const forwardInboxMessage = defineTool({
	name: "forward_inbox_message",
	title: "Forward received email",
	description:
		"Forward a received email, with its original content and attachments, to new recipients from the mailbox that received it. `text`/`html` is an optional note placed above the forwarded message. This sends real email immediately; confirm the recipients with the user first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z.object({
		id: inboxMessageIdSchema.describe("Received message to forward"),
		to: recipientsInputSchema.describe("Who to forward it to"),
		text: bodyTextSchema.describe(
			"Optional plain-text note above the forwarded email",
		),
		html: bodyHtmlSchema.describe(
			"Optional HTML note above the forwarded email",
		),
		cc: recipientsInputSchema.optional(),
		bcc: recipientsInputSchema.optional(),
		attachments: attachmentsInputSchema,
	}),
	output: sendResultSchema,
	async run(args, api) {
		return toSendResult(
			await api.inbox.forward(args.id, {
				to: args.to,
				text: args.text,
				html: args.html,
				cc: args.cc,
				bcc: args.bcc,
				attachments: toAttachmentInputs(args.attachments),
			}),
		);
	},
});
