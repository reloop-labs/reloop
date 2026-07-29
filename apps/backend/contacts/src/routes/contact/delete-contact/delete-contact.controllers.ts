import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactModel } from "@be/contacts/model/contact.model";
import { BusEvent, bus } from "@reloop/bus";
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
		const [deleted] = await db
			.delete(schema.contact)
			.where(
				and(
					eq(schema.contact.id, contactId),
					eq(schema.contact.organizationId, organizationId),
				),
			)
			.returning({
				id: schema.contact.id,
				email: schema.contact.email,
				firstName: schema.contact.firstName,
				lastName: schema.contact.lastName,
				status: schema.contact.status,
			});

		if (!deleted) {
			log.warn("Contact not found", { contactId, organizationId });
			throw ContactErrors.contactNotFound(contactId);
		}

		log.info("Contact deleted successfully", { contactId });

		await bus
			.publish(BusEvent.CONTACT_DELETED, {
				organizationId,
				contactId: deleted.id,
				email: deleted.email,
				firstName: deleted.firstName,
				lastName: deleted.lastName,
				status: deleted.status,
			})
			.catch((err) => {
				log.error("Failed to publish CONTACT_DELETED", {
					contactId,
					error: err instanceof Error ? err.message : String(err),
				});
			});

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
		if (isAppError(error)) {
			throw error;
		}
		throw ContactErrors.databaseError(
			error instanceof Error ? error.message : String(error),
		);
	}
}
