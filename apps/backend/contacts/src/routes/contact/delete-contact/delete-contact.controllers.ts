import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function deleteContactController({
	contactId,
	organizationId,
}: {
	contactId: string;
	organizationId: string;
}): Promise<ContactModel.DeleteResponse | ContactModel.ContactNotFound> {
	const log = useLogger();
	log.info("Deleting contact", { contactId });

	try {
		// Check if contact exists
		const existingContact = await db.query.contact.findFirst({
			where: and(
				eq(schema.contact.id, contactId),
				eq(schema.contact.organizationId, organizationId),
			),
		});

		if (!existingContact) {
			log.warn("Contact not found", { contactId, organizationId });
			throw ContactErrors.contactNotFound(contactId);
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

		log.info("Contact deleted successfully", { contactId });

		const result = {
			success: true,
			object: "contact" as const,
			id: existingContact.id,
			event: CONTACT_DELETE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error deleting contact", {
			contactId,
			error: error instanceof Error ? error.message : String(error),
		});
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
