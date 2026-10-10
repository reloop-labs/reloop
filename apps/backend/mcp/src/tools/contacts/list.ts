import * as z from "zod";
import { defineTool } from "../define";
import {
	contactSchema,
	contactStatusSchema,
	resourceIdSchema,
	toContactOutput,
} from "./schemas";

export const contactsList = defineTool({
	name: "contacts_list",
	title: "List contacts",
	description:
		"List contacts in the authenticated Reloop organization, newest first, with offset pagination. Use `search` for a case-insensitive substring match on the email address and `status` to filter by subscription state. Use this to look up recipients or audit the audience before creating, updating, or emailing contacts. Results are paginated: check `pagination.hasMore` and request the next `page` instead of raising `limit` beyond 100.",
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
			.describe("Only return contacts with this subscription status"),
		channelId: resourceIdSchema
			.optional()
			.describe("Only return contacts enrolled in this channel"),
	}),
	output: z.object({
		contacts: z.array(contactSchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("Contacts matching the query"),
			hasMore: z.boolean(),
		}),
		counts: z.object({
			total: z.number().int().describe("All contacts in the organization"),
			subscribed: z.number().int(),
			unsubscribed: z.number().int(),
		}),
	}),
	async run(args, api) {
		const response = await api.contacts.list({
			page: args.page,
			limit: args.limit,
			search: args.search,
			status: args.status,
			channelId: args.channelId,
		});
		return {
			contacts: response.contacts.map(toContactOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
			counts: {
				total: response.totalContacts,
				subscribed: response.subscribedContacts,
				unsubscribed: response.unsubscribedContacts,
			},
		};
	},
});
