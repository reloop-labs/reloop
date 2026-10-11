import * as z from "zod";
import { defineTool } from "../define";
import { groupSchema, toGroupOutput } from "./schemas";

export const listGroups = defineTool({
	name: "list_groups",
	title: "List groups",
	description:
		"List the contact groups of the authenticated Reloop organization with offset pagination. Groups are internal segments for organizing contacts (for example Beta testers or Enterprise customers); contacts never see them. Use this to find a group ID before list_group_contacts, add_contact_to_group, or create_contact with groupIds.",
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
			.describe("Groups per page, 1 to 100"),
		search: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.optional()
			.describe("Case-insensitive substring to match against the group name"),
	}),
	output: z.object({
		groups: z.array(groupSchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("Groups matching the query"),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.groups.list({
			page: args.page,
			limit: args.limit,
			search: args.search,
		});
		return {
			groups: response.groups.map(toGroupOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
