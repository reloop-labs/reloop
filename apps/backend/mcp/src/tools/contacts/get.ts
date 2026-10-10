import * as z from "zod";
import { ReloopError } from "../../errors/reloop-error";
import { defineTool } from "../define";
import {
	contactIdSchema,
	contactSchema,
	emailSchema,
	toContactOutput,
} from "./schemas";

export const contactsGet = defineTool({
	name: "contacts_get",
	title: "Get contact",
	description:
		"Get one contact by ID or by exact email address. Pass exactly one of `id` or `email`. Use this to check whether a contact already exists (for example before contacts_create) or to read the current properties before contacts_update. Returns a `contact_not_found` error when no contact matches.",
	annotations: {
		readOnlyHint: true,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: contactIdSchema.optional(),
			email: emailSchema.optional(),
		})
		.refine(
			(value) => (value.id === undefined) !== (value.email === undefined),
			{
				message: "Pass exactly one of id or email",
			},
		),
	output: z.object({ contact: contactSchema }),
	async run(args, api) {
		if (args.id !== undefined) {
			return { contact: toContactOutput(await api.contacts.retrieve(args.id)) };
		}
		const email = args.email;
		if (email === undefined) {
			throw new ReloopError({
				code: "validation_error",
				message: "Pass exactly one of id or email.",
				retryable: false,
			});
		}
		const contact = await api.contacts.findByEmail(email);
		if (contact === undefined) {
			throw new ReloopError({
				code: "contact_not_found",
				message: `No contact exists with email ${email}.`,
				status: 404,
				retryable: false,
				fix: "Use contacts_list with search to find similar addresses, or contacts_create to add the contact.",
			});
		}
		return { contact: toContactOutput(contact) };
	},
});
