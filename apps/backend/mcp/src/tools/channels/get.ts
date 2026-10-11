import * as z from "zod";
import { defineTool } from "../define";
import { channelIdSchema, channelSchema, toChannelOutput } from "./schemas";

export const getChannel = defineTool({
	name: "get_channel",
	title: "Get channel",
	description:
		"Get one subscription channel by ID. Returns a `channel_not_found` error when no channel matches; use list_channels to find the ID. Use list_contacts with channelId to see its subscribers.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: channelIdSchema }),
	output: z.object({ channel: channelSchema }),
	async run(args, api) {
		return { channel: toChannelOutput(await api.channels.retrieve(args.id)) };
	},
});
