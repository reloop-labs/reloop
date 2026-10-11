import * as z from "zod";
import {
	contactSelectorMessage,
	contactSelectorShape,
	hasOneContactSelector,
	toContactSelector,
} from "../contacts/schemas";
import { defineTool } from "../define";
import { groupIdSchema, membershipSchema } from "./schemas";

export const addContactToGroup = defineTool({
	name: "add_contact_to_group",
	title: "Add contact to group",
	description:
		"Add an existing contact to a group, identified by `contactId` or by `email` (exactly one). Adding a contact that is already a member changes nothing. The contact must already exist: create it with create_contact first, which can also take groupIds directly. Fails with `not_found` when the group or contact does not exist.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({ groupId: groupIdSchema, ...contactSelectorShape })
		.refine(hasOneContactSelector, { message: contactSelectorMessage }),
	output: membershipSchema,
	async run(args, api) {
		const response = await api.groups.addContact(
			args.groupId,
			toContactSelector(args),
		);
		return {
			contactId: response.id,
			groupId: response.groupId ?? args.groupId,
			groupName: response.groupName ?? null,
		};
	},
});
