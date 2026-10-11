import * as z from "zod";
import {
	contactSelectorMessage,
	contactSelectorShape,
	hasOneContactSelector,
	toContactSelector,
} from "../contacts/schemas";
import { defineTool } from "../define";
import { groupIdSchema, membershipSchema } from "./schemas";

export const removeContactFromGroup = defineTool({
	name: "remove_contact_from_group",
	title: "Remove contact from group",
	description:
		"Remove a contact from a group, identified by `contactId` or by `email` (exactly one). The contact itself is kept, with its other groups and channel subscriptions; removing a non-member changes nothing. Fails with `not_found` when the group or contact does not exist.",
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
		const response = await api.groups.removeContact(
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
