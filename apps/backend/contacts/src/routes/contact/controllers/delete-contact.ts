import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function deleteContact(
	contactId: string,
	organizationId: string,
): Promise<{ message: string }> {
	logger.info(
		{
			contactId,
			organizationId,
		},
		"Deleting contact",
	);

	try {
		// Check if contact exists
		const existingContact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
			),
		});

		if (!existingContact) {
			logger.warn({ contactId, organizationId }, "Contact not found");
			throw status(404, { message: "Contact not found" });
		}

		// Delete the contact (hard delete)
		await db
			.delete(schema.contact)
			.where(
				and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
				),
			);

		logger.info(
			{
				contactId,
				organizationId,
			},
			"Contact deleted successfully",
		);

		return { message: "Contact deleted successfully" };
	} catch (error) {
		logger.error(
			{
				contactId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting contact",
		);
		throw error;
	}
}

export async function deleteContactHandler(
	contactId: string,
	organizationId: string,
): Promise<{ message: string }> {
	return deleteContact(contactId, organizationId);
}
