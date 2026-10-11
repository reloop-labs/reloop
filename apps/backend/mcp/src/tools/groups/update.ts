import * as z from "zod";
import { defineTool } from "../define";
import { groupIdSchema, groupSchema, toGroupOutput } from "./schemas";

export const updateGroup = defineTool({
	name: "update_group",
	title: "Rename group",
	description:
		"Rename a contact group by ID. Members are unchanged. Fails with `group_already_exists` when another group already has that name.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({
		id: groupIdSchema,
		name: z.string().trim().min(1).max(255).describe("New group name"),
	}),
	output: z.object({ group: groupSchema }),
	async run(args, api) {
		return {
			group: toGroupOutput(await api.groups.rename(args.id, args.name)),
		};
	},
});
