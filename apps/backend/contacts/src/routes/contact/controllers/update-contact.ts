import { formatContactResponse } from "@be/contacts/routes/contact/controllers/format-contact-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateContact(
	contactId: string,
	organizationId: string,
	body: ContactTypes.UpdateContactRequest,
): Promise<ContactTypes.ContactResponse> {
	logger.info(
		{
			contactId,
			organizationId,
			body,
		},
		"Updating contact",
	);

	try {
		// Check if contact exists
		const existingContact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		});

		if (!existingContact) {
			logger.warn({ contactId, organizationId }, "Contact not found");
			throw status(404, { message: "Contact not found" });
		}

		// Update the contact
		const updateData: Partial<typeof schema.contact.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (body.status !== undefined) {
			updateData.status = body.status;
		}

		const [updatedContact] = await db
			.update(schema.contact)
			.set(updateData)
			.where(
				and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
				),
			)
			.returning();

		if (!updatedContact) {
			logger.error(
				{ contactId },
				"Failed to update contact - no data returned",
			);
			throw status(500, { message: "Failed to update contact" });
		}

		logger.info(
			{
				contactId,
				organizationId,
			},
			"Contact updated successfully",
		);

		return formatContactResponse(updatedContact);
	} catch (error) {
		logger.error(
			{
				contactId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating contact",
		);
		throw error;
	}
}

export async function updateContactHandler(
	contactId: string,
	organizationId: string,
	body: ContactTypes.UpdateContactRequest,
): Promise<ContactTypes.ContactResponse> {
	return updateContact(contactId, organizationId, body);
}
