import * as z from "zod";
import { defineTool } from "../define";
import {
	contactSchema,
	contactStatusSchema,
	emailSchema,
	propertiesSchema,
	resourceIdSchema,
	toContactOutput,
} from "./schemas";

export const contactsCreate = defineTool({
	name: "contacts_create",
	title: "Create contact",
	description:
		"Create a new contact in the Reloop organization. Fails with `contact_already_exists` if the email is already a contact; use contacts_get first when unsure. Optionally set name, subscription status (defaults to subscribed), custom properties, group memberships, and channel subscriptions. Creating a contact does not send any email.",
	annotations: {
		readOnlyHint: false,
		destructiveHint: false,
		idempotentHint: false,
		openWorldHint: false,
	},
	input: z.object({
		email: emailSchema,
		firstName: z.string().trim().max(255).optional(),
		lastName: z.string().trim().max(255).optional(),
		status: contactStatusSchema
			.optional()
			.describe("Subscription status; defaults to subscribed"),
		properties: propertiesSchema.optional(),
		groupIds: z
			.array(resourceIdSchema)
			.max(100)
			.optional()
			.describe("IDs of groups to add the contact to"),
		channels: z
			.array(
				z.object({
					channelId: resourceIdSchema,
					subscription: z.enum(["opt_in", "opt_out"]),
				}),
			)
			.max(100)
			.optional()
			.describe("Channels to enroll the contact in"),
	}),
	output: z.object({ contact: contactSchema }),
	async run(args, api) {
		const contact = await api.contacts.create({
			email: args.email,
			firstName: args.firstName,
			lastName: args.lastName,
			status: args.status,
			properties: args.properties,
			groupIds: args.groupIds,
			channels: args.channels,
		});
		return { contact: toContactOutput(contact) };
	},
});
