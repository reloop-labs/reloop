import * as z from "zod";
import { defineTool } from "../define";
import { groupIdSchema, groupSchema, toGroupOutput } from "./schemas";

export const getGroup = defineTool({
	name: "get_group",
	title: "Get group",
	description:
		"Get one contact group by ID. Returns a `group_not_found` error when no group matches; use list_groups to find the ID. Use list_group_contacts for its members.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: groupIdSchema }),
	output: z.object({ group: groupSchema }),
	async run(args, api) {
		return { group: toGroupOutput(await api.groups.retrieve(args.id)) };
	},
});
