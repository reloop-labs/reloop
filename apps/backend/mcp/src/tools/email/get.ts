import * as z from "zod";
import { defineTool } from "../define";
import { emailIdSchema, originSchema, toOriginOutput } from "./log-schemas";

export const getEmail = defineTool({
	name: "get_email",
	title: "Get email",
	description:
		"Get one sent email by its log ID, with its delivery timeline (`events` such as delivered, opened, clicked, bounced) and the error message when delivery failed. Bodies are omitted unless `includeBody` is true, because HTML bodies can be large. Returns an `email_not_found` error when no email matches.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: emailIdSchema,
		includeBody: z
			.boolean()
			.default(false)
			.describe("Also return the text and HTML bodies"),
	}),
	output: z.object({
		email: z.object({
			id: z.string(),
			messageId: z.string(),
			domainId: z.string(),
			from: z.string(),
			fromName: z.string().nullable(),
			to: z.array(z.string()),
			cc: z.array(z.string()),
			bcc: z.array(z.string()),
			replyTo: z.string().nullable(),
			subject: z.string(),
			status: z.string(),
			errorMessage: z.string().nullable(),
			sizeBytes: z.number(),
			source: z.string().nullable(),
			origin: originSchema,
			attachments: z.array(
				z.object({
					filename: z.string(),
					contentType: z.string(),
					sizeBytes: z.number(),
				}),
			),
			events: z.array(
				z.object({
					type: z.string(),
					createdAt: z.string(),
					metadata: z.unknown(),
				}),
			),
			text: z.string().nullable().optional(),
			html: z.string().nullable().optional(),
			sentAt: z.string().nullable(),
			deliveredAt: z.string().nullable(),
			failedAt: z.string().nullable(),
			createdAt: z.string(),
		}),
	}),
	async run(args, api) {
		const email = await api.emailLogs.retrieve(args.id);
		const bodies = args.includeBody
			? { text: email.textBody, html: email.htmlBody }
			: {};
		return {
			email: {
				id: email.id,
				messageId: email.messageId,
				domainId: email.domainId,
				from: email.fromEmail,
				fromName: email.fromName,
				to: email.toEmails,
				cc: email.ccEmails ?? [],
				bcc: email.bccEmails ?? [],
				replyTo: email.replyTo,
				subject: email.subject,
				status: email.status,
				errorMessage: email.errorMessage,
				sizeBytes: email.size,
				source: email.source ?? null,
				origin: toOriginOutput(email.origin),
				attachments: (email.attachments ?? []).map((attachment) => ({
					filename: attachment.filename,
					contentType: attachment.contentType,
					sizeBytes: attachment.size,
				})),
				events: (email.events ?? []).map((event) => ({
					type: event.type,
					createdAt: event.createdAt,
					metadata: event.metadata,
				})),
				...bodies,
				sentAt: email.sentAt,
				deliveredAt: email.deliveredAt,
				failedAt: email.failedAt,
				createdAt: email.createdAt,
			},
		};
	},
});
