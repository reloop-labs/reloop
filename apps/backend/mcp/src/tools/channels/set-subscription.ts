import * as z from "zod";
import {
	contactSelectorMessage,
	contactSelectorShape,
	hasOneContactSelector,
	toContactSelector,
} from "../contacts/schemas";
import { defineTool } from "../define";
import { channelIdSchema, subscriptionSchema } from "./schemas";

export const setChannelSubscription = defineTool({
	name: "set_channel_subscription",
	title: "Set channel subscription",
	description:
		"Subscribe (`opt_in`) or unsubscribe (`opt_out`) an existing contact on one channel, identified by `contactId` or by `email` (exactly one). Enrolls the contact if they were never on the channel; setting the state they already have changes nothing. Only change a subscription when the contact asked for it or the user has their consent: opting someone back in after they unsubscribed can violate anti-spam law. Fails with `not_found` when the channel or contact does not exist.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			channelId: channelIdSchema,
			...contactSelectorShape,
			subscription: subscriptionSchema.describe(
				"opt_in to receive this channel, opt_out to stop receiving it",
			),
		})
		.refine(hasOneContactSelector, { message: contactSelectorMessage }),
	output: z.object({
		contactId: z.string().nullable(),
		channelId: z.string(),
		channelName: z.string().nullable(),
		subscription: subscriptionSchema,
		status: z
			.enum(["enrolled", "unenrolled"])
			.describe("enrolled receives the channel; unenrolled does not"),
	}),
	async run(args, api) {
		const response = await api.channels.setSubscription(args.channelId, {
			...toContactSelector(args),
			subscription: args.subscription,
		});
		return {
			contactId: response.id ?? null,
			channelId: response.channelId ?? args.channelId,
			channelName: response.channelName ?? null,
			subscription: response.subscription ?? args.subscription,
			status: response.status,
		};
	},
});
