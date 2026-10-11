import * as z from "zod";
import { defineTool } from "../define";
import { groupIdSchema } from "./schemas";

export const deleteGroup = defineTool({
	name: "delete_group",
	title: "Delete group",
	description:
		"Delete a contact group by ID. The contacts themselves are kept; they only lose this membership. Use get_group to confirm the right group first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: groupIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.groups.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
