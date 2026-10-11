import * as z from "zod";
import { contactStatusSchema } from "../contacts/schemas";
import { defineTool } from "../define";
import {
	groupContactSchema,
	groupIdSchema,
	toGroupContactOutput,
} from "./schemas";

export const listGroupContacts = defineTool({
	name: "list_group_contacts",
	title: "List group contacts",
	description:
		"List the contacts that belong to one group, with offset pagination. Use `search` for a case-insensitive substring match on the email address and `status` to filter by subscription state. Items are lean: use get_contact for a member's groups and channels.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: groupIdSchema,
		page: z.number().int().min(1).default(1).describe("1-based page number"),
		limit: z
			.number()
			.int()
			.min(1)
			.max(100)
			.default(20)
			.describe("Contacts per page, 1 to 100"),
		search: z
			.string()
			.trim()
			.min(1)
			.max(320)
			.optional()
			.describe(
				"Case-insensitive substring to match against contact email addresses",
			),
		status: contactStatusSchema
			.optional()
			.describe("Only return members with this subscription status"),
	}),
	output: z.object({
		group: z.object({ id: z.string(), name: z.string() }),
		contacts: z.array(groupContactSchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("Members matching the query"),
			hasMore: z.boolean(),
		}),
		counts: z.object({
			subscribed: z.number().int(),
			unsubscribed: z.number().int(),
		}),
	}),
	async run(args, api) {
		const response = await api.groups.listContacts(args.id, {
			page: args.page,
			limit: args.limit,
			search: args.search,
			status: args.status,
		});
		return {
			group: { id: response.group.id, name: response.group.name },
			contacts: response.group.contacts.map(toGroupContactOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
			counts: {
				subscribed: response.subscribedContacts,
				unsubscribed: response.unsubscribedContacts,
			},
		};
	},
});
