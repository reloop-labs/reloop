import * as z from "zod";
import { defineTool } from "../define";
import { groupSchema, toGroupOutput } from "./schemas";

export const createGroup = defineTool({
	name: "create_group",
	title: "Create group",
	description:
		"Create an empty contact group. Fails with `group_already_exists` when a group with that name exists; use list_groups first when unsure. Add members afterwards with add_contact_to_group, or pass the group ID in create_contact's groupIds.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		name: z
			.string()
			.trim()
			.min(1)
			.max(50)
			.describe("Group name, up to 50 characters"),
	}),
	output: z.object({ group: groupSchema }),
	async run(args, api) {
		return { group: toGroupOutput(await api.groups.create(args.name)) };
	},
});
