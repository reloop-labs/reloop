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
		// Use DELETE...RETURNING to check existence and delete in a single round-trip.
		const [deleted] = await db
			.delete(schema.contact)
			.where(
				and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
				),
			)
			.returning({ id: schema.contact.id });

		if (!deleted) {
			log.warn("Contact not found", { contactId, organizationId });
			throw ContactErrors.contactNotFound(contactId);
		}

		log.info("Contact deleted successfully", { contactId });

		return {
			success: true,
			object: "contact" as const,
			id: deleted.id,
			event: CONTACT_DELETE_WEBHOOK_EVENT.id,
		};
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
