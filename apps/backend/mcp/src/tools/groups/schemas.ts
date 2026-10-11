import * as z from "zod";
import type { Group, GroupContact } from "../../reloop/types";
import {
	contactStatusSchema,
	creatorSchema,
	resourceIdSchema,
} from "../contacts/schemas";

export const groupIdSchema = resourceIdSchema.describe(
	"Group ID as returned by Reloop, for example grp_123456789",
);

export const groupSchema = z.object({
	id: z.string(),
	name: z.string(),
	createdBy: creatorSchema,
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toGroupOutput(group: Group): z.output<typeof groupSchema> {
	return {
		id: group.id,
		name: group.name,
		createdBy:
			group.createdBy === undefined
				? null
				: {
						id: group.createdBy.id,
						name: group.createdBy.name,
						email: group.createdBy.email,
					},
		createdAt: group.createdAt,
		updatedAt: group.updatedAt,
	};
}

export const groupContactSchema = z.object({
	id: z.string(),
	email: z.string(),
	firstName: z.string().nullable(),
	lastName: z.string().nullable(),
	status: contactStatusSchema,
	properties: z.record(z.string(), z.union([z.string(), z.number()])),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export function toGroupContactOutput(
	contact: GroupContact,
): z.output<typeof groupContactSchema> {
	return {
		id: contact.id,
		email: contact.email,
		firstName: contact.firstName,
		lastName: contact.lastName,
		status: contact.status,
		properties: contact.properties,
		createdAt: contact.createdAt,
		updatedAt: contact.updatedAt,
	};
}

export const membershipSchema = z.object({
	contactId: z.string(),
	groupId: z.string(),
	groupName: z.string().nullable(),
});
