import * as z from "zod";
import { defineTool } from "../define";
import {
	emailStatusFilterSchema,
	emailSummarySchema,
	toEmailSummaryOutput,
} from "./log-schemas";

export const listEmails = defineTool({
	name: "list_emails",
	title: "List emails",
	description:
		"List emails sent by the authenticated Reloop organization, newest first, with offset pagination. Covers API, SMTP, campaign, and automation sends. Filter by `recipient` (exact address), `status`, sending `domain`, a `search` on subject or sender, or a time window. Use this to answer whether an email reached someone, then get_email for its delivery events.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.describe("Emails per page, 1 to 100"),
		recipient: z
			.string()
			.trim()
			.min(3)
			.max(320)
			.optional()
			.describe("Only emails sent to exactly this address"),
		status: emailStatusFilterSchema
			.optional()
			.describe("Only emails whose latest status is this"),
		domain: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.optional()
			.describe(
				"Only emails sent from this domain, for example send.example.com",
			),
		search: z
			.string()
			.trim()
			.min(1)
			.max(320)
			.optional()
			.describe(
				"Case-insensitive substring to match against the subject or sender address; use recipient to filter by recipient",
			),
		since: z.iso
			.datetime({ offset: true })
			.optional()
			.describe("Only emails created at or after this ISO 8601 timestamp"),
		until: z.iso
			.datetime({ offset: true })
			.optional()
			.describe("Only emails created at or before this ISO 8601 timestamp"),
	}),
	output: z.object({
		emails: z.array(emailSummarySchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("Emails matching the query"),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.emailLogs.list({
			page: args.page,
			limit: args.limit,
			recipient: args.recipient,
			status: args.status,
			domain: args.domain,
			search: args.search,
			start_date: args.since,
			end_date: args.until,
		});
		return {
			emails: response.data.map(toEmailSummaryOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
