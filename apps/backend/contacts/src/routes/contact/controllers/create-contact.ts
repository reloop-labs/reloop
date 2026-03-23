import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createContact(
	organizationId: string,
	userId: string,
	body: ContactTypes.CreateContactRequest,
): Promise<ContactTypes.ContactResponse> {
	logger.info(
		{
			email: body.email,
			organizationId,
		},
		"Creating contact",
	);

	try {
		// Check if contact already exists in this organization
		const existingContact = await db
			.select()
			.from(schema.contact)
			.where(
				and(
					eq(schema.contact.email, body.email),
					eq(schema.contact.organizationId, organizationId),
					isNull(schema.contact.deletedAt),
				),
			)
			.limit(1);

		if (existingContact.length > 0) {
			logger.warn(
				{ email: body.email },
				"Contact already exists in this organization",
			);
			throw status(409, { message: "Contact already exists" });
		}

		const [newContact] = await db
			.insert(schema.contact)
			.values({
				email: body.email,
				firstName: body.firstName || null,
				lastName: body.lastName || null,
				status: (body.status as any) || "subscribed",
				organizationId,
				userId,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newContact) {
			logger.error(
				{ email: body.email },
				"Failed to create contact - no data returned",
			);
			throw status(500, { message: "Failed to create contact" });
		}

		// Handle property values if provided
		if (body.properties && Object.keys(body.properties).length > 0) {
			const propertyNames = Object.keys(body.properties);

			// 1. Fetch existing properties for this organization
			const existingProperties = await db
				.select()
				.from(schema.contactProperty)
				.where(
					and(
						inArray(schema.contactProperty.propertyName, propertyNames),
						eq(schema.contactProperty.organizationId, organizationId),
					),
				);

			const propertyNameToId = new Map(
				existingProperties.map((p) => [p.propertyName, p.id]),
			);

			// 2. Process each property from the request
			for (const [name, value] of Object.entries(body.properties)) {
				let propertyId = propertyNameToId.get(name);

				if (!propertyId) {
					// Create new property if it doesn't exist
					const [newProp] = await db
						.insert(schema.contactProperty)
						.values({
							propertyName: name,
							propertyType: "string",
							organizationId,
							userId,
							createdAt: new Date(),
							updatedAt: new Date(),
						})
						.returning();

					if (newProp) {
						propertyId = newProp.id;
						propertyNameToId.set(name, propertyId);
					}
				}

				if (propertyId) {
					// Insert property value
					await db.insert(schema.contactPropertyValue).values({
						contactId: newContact.id,
						propertyId,
						value,
						organizationId,
						userId,
					});
				}
			}
		}

		logger.info(
			{
				email: body.email,
				id: newContact.id,
			},
			"Contact created successfully",
		);

		return formatContactResponse({
			...newContact,
			properties: body.properties || {},
		});
	} catch (error) {
		logger.error(
			{
				email: body.email,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating contact",
		);
		throw error;
	}
}

// Handler for creating multiple contacts at once
export async function createContacts(
	organizationId: string,
	userId: string,
	emails: string[],
): Promise<{ contacts: ContactTypes.ContactResponse[]; skipped: string[] }> {
	logger.info(
		{
			emailCount: emails.length,
			organizationId,
		},
		"Creating multiple contacts",
	);

	const createdContacts: ContactTypes.ContactResponse[] = [];
	const skippedEmails: string[] = [];

	for (const email of emails) {
		try {
			const contact = await createContact(organizationId, userId, { email });
			createdContacts.push(contact);
		} catch {
			// If contact already exists, skip it
			skippedEmails.push(email);
		}
	}

	logger.info(
		{
			created: createdContacts.length,
			skipped: skippedEmails.length,
			organizationId,
		},
		"Multiple contacts creation completed",
	);

	return { contacts: createdContacts, skipped: skippedEmails };
}

export async function createContactHandler(
	organizationId: string,
	userId: string,
	body: ContactTypes.CreateContactRequest,
): Promise<ContactTypes.ContactResponse> {
	return createContact(organizationId, userId, body);
}
