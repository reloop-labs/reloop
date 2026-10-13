import * as z from "zod";
import { defineTool } from "../define";
import { subjectSchema } from "../email/schemas";
import {
	attachmentsInputSchema,
	bodyHtmlSchema,
	bodyTextSchema,
	mailboxIdSchema,
	recipientsInputSchema,
	sendResultSchema,
	toAttachmentInputs,
	toSendResult,
} from "./schemas";

export const sendMailboxEmail = defineTool({
	name: "send_mailbox_email",
	title: "Send email from mailbox",
	description:
		"Send a new email FROM one of the organization's inbox mailboxes, so replies come back to that inbox. This delivers real email and cannot be recalled unless `undoWindowSeconds` or `scheduledAt` is set; confirm recipients, subject, and body with the user first. Get the mailbox ID from list_mailboxes. To answer a received email, use reply_to_inbox_message instead so it stays in the same thread.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z
		.object({
			mailboxId: mailboxIdSchema.describe("Mailbox to send from"),
			to: recipientsInputSchema.describe(
				"Recipient address or up to 50 addresses",
			),
			subject: subjectSchema,
			text: bodyTextSchema,
			html: bodyHtmlSchema,
			cc: recipientsInputSchema.optional(),
			bcc: recipientsInputSchema.optional(),
			attachments: attachmentsInputSchema,
			scheduledAt: z.iso
				.datetime({ offset: true })
				.optional()
				.describe("ISO 8601 time to send later instead of now"),
			undoWindowSeconds: z
				.number()
				.int()
				.min(0)
				.max(3600)
				.optional()
				.describe(
					"Hold the email this many seconds so it can still be cancelled",
				),
		})
		.refine((value) => value.text !== undefined || value.html !== undefined, {
			message: "Provide text or html",
		}),
	output: sendResultSchema,
	async run(args, api) {
		return toSendResult(
			await api.inbox.send({
				mailboxId: args.mailboxId,
				to: args.to,
				subject: args.subject,
				text: args.text,
				html: args.html,
				cc: args.cc,
				bcc: args.bcc,
				attachments: toAttachmentInputs(args.attachments),
				scheduledAt: args.scheduledAt,
				undoWindowSeconds: args.undoWindowSeconds,
			}),
		);
	},
});
