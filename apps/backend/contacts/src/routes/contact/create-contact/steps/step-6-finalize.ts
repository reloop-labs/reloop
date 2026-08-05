import type { ContactTypes } from "@be/contacts/types/contact.type";
import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

export async function finalizeContactCreation_step6({
	newContact,
	organizationId,
	db,
}: {
	newContact: typeof schema.contact.$inferSelect;
	organizationId: string;
	db: DatabaseInstance;
}): Promise<ContactTypes.ContactResponse> {
	const updatedProperties = await db
		.select({
			name: schema.contactProperty.propertyName,
			value: schema.contactPropertyValue.value,
			type: schema.contactProperty.propertyType,
		})
		.from(schema.contactPropertyValue)
		.innerJoin(
			schema.contactProperty,
			eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
		)
		.where(
			and(
				eq(schema.contactPropertyValue.contactId, newContact.id),
				eq(schema.contactPropertyValue.organizationId, organizationId),
				isNull(schema.contactProperty.deletedAt),
				isNull(schema.contactPropertyValue.deletedAt),
			),
		);

	const propertiesRecord = updatedProperties.reduce(
		(acc, curr) => {
			acc[curr.name] = curr.type === "number" ? Number(curr.value) : curr.value;
			return acc;
		},
		{} as Record<string, string | number>,
	);

	const channelRows = await db
		.select({
			id: schema.channel.id,
			name: schema.channel.name,
			status: schema.channelSubscription.status,
		})
		.from(schema.channelSubscription)
		.innerJoin(
			schema.channel,
			eq(schema.channelSubscription.channelId, schema.channel.id),
		)
		.where(
			and(
				eq(schema.channelSubscription.contactId, newContact.id),
				eq(schema.channelSubscription.organizationId, organizationId),
				isNull(schema.channelSubscription.deletedAt),
				isNull(schema.channel.deletedAt),
			),
		);

	const channels = channelRows.map((row) => ({
		id: row.id,
		name: row.name,
		subscription: (row.status === "enrolled" ? "opt_in" : "opt_out") as
			| "opt_in"
			| "opt_out",
	}));

	const result = {
		object: "contact" as const,
		id: newContact.id,
		email: newContact.email,
		firstName: newContact.firstName,
		lastName: newContact.lastName,
		status: newContact.status,
		properties: propertiesRecord ?? {},
		groups: (newContact as ContactTypes.ContactData).groups ?? [],
		channels,
		suppressionReason: newContact.suppressionReason ?? null,
		suppressedAt: newContact.suppressedAt ?? null,
		createdAt: newContact.createdAt,
		updatedAt: newContact.updatedAt,
		event: CONTACT_CREATE_WEBHOOK_EVENT.id,
	};

	return result;
}
