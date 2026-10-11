import * as z from "zod";
import { defineTool } from "../define";
import {
	channelIdSchema,
	channelSchema,
	channelSettingsShape,
	toChannelOutput,
} from "./schemas";

export const updateChannel = defineTool({
	name: "update_channel",
	title: "Update channel",
	description:
		"Update a subscription channel by ID: name, description, default subscription, or visibility. Only the fields you pass change. Changing `defaultSubscription` affects contacts enrolled from now on, not existing subscriptions. Fails with `channel_already_exists` when another channel already has the new name.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: channelIdSchema,
			name: z
				.string()
				.trim()
				.min(1)
				.max(255)
				.optional()
				.describe("New channel name"),
			...channelSettingsShape,
		})
		.refine(
			(value) =>
				value.name !== undefined ||
				value.description !== undefined ||
				value.defaultSubscription !== undefined ||
				value.visibility !== undefined,
			{ message: "Pass at least one field to update" },
		),
	output: z.object({ channel: channelSchema }),
	async run(args, api) {
		const channel = await api.channels.update(args.id, {
			name: args.name,
			description: args.description,
			defaultSubscription: args.defaultSubscription,
			visibility: args.visibility,
		});
		return { channel: toChannelOutput(channel) };
	},
});
