import * as z from "zod";
import { defineTool } from "../define";
import {
	contactIdSchema,
	contactSchema,
	contactStatusSchema,
	emailSchema,
	propertiesSchema,
	toContactOutput,
} from "./schemas";

export const updateContact = defineTool({
	name: "update_contact",
	title: "Update contact",
	description:
		"Update an existing contact by ID. Only the fields you pass change, except `properties`, which replaces the contact's entire property set: read the current properties with get_contact and pass the full merged object to keep existing values. Use get_contact to resolve an email address to an ID first.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: true,
		openWorldHint: false,
	},
	input: z
		.object({
			id: contactIdSchema,
			email: emailSchema.optional(),
			firstName: z.string().trim().max(255).optional(),
			lastName: z.string().trim().max(255).optional(),
			status: contactStatusSchema.optional(),
			properties: propertiesSchema.optional(),
		})
		.refine(
			(value) =>
				value.email !== undefined ||
				value.firstName !== undefined ||
				value.lastName !== undefined ||
				value.status !== undefined ||
				value.properties !== undefined,
			{ message: "Pass at least one field to update" },
		),
	output: z.object({ contact: contactSchema }),
	async run(args, api) {
		const contact = await api.contacts.update(args.id, {
			email: args.email,
			firstName: args.firstName,
			lastName: args.lastName,
			status: args.status,
			properties: args.properties,
		});
		return { contact: toContactOutput(contact) };
	},
});
