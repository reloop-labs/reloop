import * as z from "zod";
import { defineTool } from "../define";
import { channelSchema, toChannelOutput } from "./schemas";

export const listChannels = defineTool({
	name: "list_channels",
	title: "List channels",
	description:
		"List the subscription channels of the authenticated Reloop organization with their subscriber counts, with offset pagination. Channels are the email topics contacts can subscribe to or unsubscribe from on their preference page (for example Product updates or Newsletter). Use this to find a channel ID for send_email's channelId, list_contacts' channelId filter, or set_channel_subscription.",
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
			.describe("Channels per page, 1 to 100"),
	}),
	output: z.object({
		channels: z.array(channelSchema),
		pagination: z.object({
			page: z.number().int(),
			limit: z.number().int(),
			total: z.number().int().describe("Channels in the organization"),
			hasMore: z.boolean(),
		}),
	}),
	async run(args, api) {
		const response = await api.channels.list({
			page: args.page,
			limit: args.limit,
		});
		return {
			channels: response.channels.map(toChannelOutput),
			pagination: {
				page: response.page,
				limit: response.limit,
				total: response.total,
				hasMore: args.page * args.limit < response.total,
			},
		};
	},
});
