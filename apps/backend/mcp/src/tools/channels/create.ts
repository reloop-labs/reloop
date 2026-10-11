import * as z from "zod";
import { defineTool } from "../define";
import {
	channelSchema,
	channelSettingsShape,
	toChannelOutput,
} from "./schemas";

export const createChannel = defineTool({
	name: "create_channel",
	title: "Create channel",
	description:
		"Create a subscription channel. Defaults to `opt_in` and `private`. Fails with `channel_already_exists` when a channel with that name exists; use list_channels first when unsure. Enroll contacts with set_channel_subscription or create_contact's channels.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		name: z.string().trim().min(1).max(255).describe("Channel name"),
		...channelSettingsShape,
	}),
	output: z.object({ channel: channelSchema }),
	async run(args, api) {
		const channel = await api.channels.create({
			name: args.name,
			description: args.description,
			defaultSubscription: args.defaultSubscription,
			visibility: args.visibility,
		});
		return { channel: toChannelOutput(channel) };
	},
});
