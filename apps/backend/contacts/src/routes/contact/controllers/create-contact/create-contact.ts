import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import { upsertContactProperties } from "@be/contacts/routes/contact/controllers/upsert-contact-properties";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import { getExistingContact } from "./get-existing-contact";

export async function createContact(
	organizationId: string,
	userId: string,
	body: ContactTypes.CreateContactRequest,
	logger: Logger,
): Promise<ContactTypes.ContactResponse> {
	const { email } = body;
	try {
		return await db.transaction(async (tx) => {
			const existingContact = await getExistingContact({
				email,
				organizationId,
				logger,
				db: tx,
			});
			if (existingContact) {
				logger.warn({ email }, "Contact already exists in this organization");
				throw status(409, { message: "Contact already exists" });
			}

			logger.warn({ email }, "Contact not found, creating new contact");
			const [newContact] = await tx
				.insert(schema.contact)
				.values({
					email: body.email,
					firstName: body.firstName || null,
					lastName: body.lastName || null,
					status: body.status || "subscribed",
					organizationId,
					userId,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (!newContact) {
				logger.error({ email }, "Failed to create contact - no data returned");
				throw status(500, { message: "Failed to create contact" });
			}
			logger.info({ ...newContact }, "Contact added");
			if (body.properties && Object.keys(body.properties).length > 0) {
				await upsertContactProperties(
					newContact.id,
					organizationId,
					userId,
					body.properties,
					logger,
					tx,
				);
			}
			logger.info(
				{
					email: body.email,
					id: newContact.id,
				},
				"Contact created successfully",
			);

			// Fetch final properties to ensure types are correct in response
			const updatedProperties = await tx
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
					acc[curr.name] =
						curr.type === "number" ? Number(curr.value) : curr.value;
					return acc;
				},
				{} as Record<string, string | number>,
			);

			return formatContactResponse({
				...newContact,
				properties: propertiesRecord,
			});
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
