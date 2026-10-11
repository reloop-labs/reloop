import * as z from "zod";
import { defineTool } from "../define";
import {
	domainStatusSchema,
	domainSummarySchema,
	toDomainSummaryOutput,
} from "./schemas";

export const listDomains = defineTool({
	name: "list_domains",
	title: "List domains",
	description:
		"List the sending domains of the authenticated Reloop organization with their verification status and settings, with offset pagination. Use this to pick a verified `from` domain before send_email (only `active` domains can send) or to find a domain ID. DNS records are omitted here; use get_domain for them.",
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
			.describe("Domains per page, 1 to 100"),
		search: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.optional()
			.describe("Case-insensitive substring to match against the domain name"),
		status: domainStatusSchema
			.optional()
			.describe("Only return domains with this verification status"),
	}),
	output: z.object({
		domains: z.array(domainSummarySchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("Domains matching the query"),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.domains.list({
			page: args.page,
			limit: args.limit,
			q: args.search,
			status: args.status,
		});
		return {
			domains: response.domains.map(toDomainSummaryOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
