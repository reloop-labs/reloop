import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getContact(
	contactId: string,
	organizationId: string,
): Promise<ContactTypes.ContactResponse> {
	logger.info(
		{
			contactId,
			organizationId,
		},
		"Getting contact",
	);

	try {
		const contact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		});

		if (!contact) {
			logger.warn({ contactId, organizationId }, "Contact not found");
			throw status(404, { message: "Contact not found" });
		}

		// Fetch properties for this contact
		const properties = await db
			.select({
				name: schema.contactProperty.propertyName,
				value: schema.contactPropertyValue.value,
			})
			.from(schema.contactPropertyValue)
			.innerJoin(
				schema.contactProperty,
				eq(schema.contactPropertyValue.propertyId, schema.contactProperty.id),
			)
			.where(eq(schema.contactPropertyValue.contactId, contactId));

		// Map properties to Record<string, string>
		const propertiesRecord = properties.reduce(
			(acc, curr) => {
				acc[curr.name] = curr.value;
				return acc;
			},
			{} as Record<string, string>,
		);

		logger.info(
			{
				contactId,
				organizationId,
				propertyCount: properties.length,
			},
			"Contact retrieved successfully",
		);

		return formatContactResponse({
			...contact,
			properties: propertiesRecord,
		});
	} catch (error) {
		logger.error(
			{
				contactId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting contact",
		);
		throw error;
	}
}

export async function getContactHandler(
	contactId: string,
	organizationId: string,
): Promise<ContactTypes.ContactResponse> {
	return getContact(contactId, organizationId);
}
