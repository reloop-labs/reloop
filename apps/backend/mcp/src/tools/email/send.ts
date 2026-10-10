import * as z from "zod";
import { resourceIdSchema } from "../contacts/schemas";
import { defineTool } from "../define";
import {
	addressSchema,
	headersSchema,
	recipientsSchema,
	subjectSchema,
	tagSchema,
	templateSchema,
} from "./schemas";

export const emailSend = defineTool({
	name: "email_send",
	title: "Send email",
	description:
		"Send a transactional email through Reloop. This delivers real email to the recipients immediately (or at `scheduledAt`) and cannot be recalled, so confirm the sender, recipients, subject, and body before calling. `from` must use a sending domain that is verified in the Reloop organization; otherwise the call fails with `not_found` or a DNS `validation_error`. Provide `html` and/or `text`, or a `template` with variables. Returns the email log `id` for later inspection. Do not use this for bulk or marketing sends to many contacts.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: false,
		openWorldHint: true,
	},
	input: z
		.object({
			from: addressSchema.describe(
				"Sender, on a verified sending domain: user@example.com or Jane Doe <user@example.com>",
			),
			to: recipientsSchema.describe(
				"Recipient address or list of up to 50 addresses",
			),
			subject: subjectSchema,
			text: z.string().max(1_000_000).optional().describe("Plain-text body"),
			html: z.string().max(2_000_000).optional().describe("HTML body"),
			cc: recipientsSchema.optional(),
			bcc: recipientsSchema.optional(),
			replyTo: recipientsSchema
				.optional()
				.describe("Reply-To address or addresses"),
			headers: headersSchema.optional(),
			tags: z
				.array(tagSchema)
				.max(50)
				.optional()
				.describe(
					"Key/value tags attached to the email for filtering and analytics",
				),
			template: templateSchema
				.optional()
				.describe(
					"Reloop template to render instead of, or merged with, html/text",
				),
			scheduledAt: z.iso
				.datetime({ offset: true })
				.optional()
				.describe(
					"ISO 8601 timestamp to send at instead of immediately; must be in the future",
				),
			channelId: resourceIdSchema
				.optional()
				.describe(
					"Subscription channel this email belongs to, for preference management",
				),
		})
		.refine(
			(value) =>
				value.text !== undefined ||
				value.html !== undefined ||
				value.template !== undefined,
			{ message: "Provide text, html, or a template" },
		),
	output: z.object({
		id: z.string().describe("Reloop email log ID"),
		messageId: z.string(),
		status: z.string().describe("sent or scheduled"),
		timestamp: z.string(),
	}),
	async run(args, api) {
		const response = await api.mail.send({
			from: args.from,
			to: args.to,
			subject: args.subject,
			text: args.text,
			html: args.html,
			cc: args.cc,
			bcc: args.bcc,
			reply_to: args.replyTo,
			headers: args.headers,
			tags: args.tags,
			template: args.template,
			scheduled_at: args.scheduledAt,
			channel_id: args.channelId,
		});
		return {
			id: response.id,
			messageId: response.messageId,
			status: response.status,
			timestamp: response.timestamp,
		};
	},
});
