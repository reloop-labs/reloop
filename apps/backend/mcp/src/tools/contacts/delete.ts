import * as z from "zod";
import { defineTool } from "../define";
import { contactIdSchema } from "./schemas";

export const contactsDelete = defineTool({
	name: "contacts_delete",
	title: "Delete contact",
	description:
		'Permanently delete a contact by ID. This cannot be undone and removes the contact from all groups and channels. To stop emailing someone without deleting their record, prefer contacts_update with status "unsubscribed". Use contacts_get to resolve an email to an ID and confirm the right record first.',
	annotations: {
		readOnlyHint: false,
		destructiveHint: true,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z.object({ id: contactIdSchema }),
	output: z.object({ deleted: z.literal(true), id: z.string() }),
	async run(args, api) {
		const response = await api.contacts.remove(args.id);
		return { deleted: true as const, id: response.id };
	},
});
