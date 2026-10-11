import * as z from "zod";
import { defineTool } from "../define";
import { channelIdSchema } from "./schemas";

export const deleteChannel = defineTool({
	name: "delete_channel",
	title: "Delete channel",
	description:
		"Delete a subscription channel by ID, together with every contact's subscription to it. The contacts themselves are kept. Use get_channel to confirm the right channel first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: channelIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.channels.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
