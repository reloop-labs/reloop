import type { ContactModel } from "@be/contacts/model/contact.model";
import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { CONTACT_UPDATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function removeContactFromGroupController({
	organizationId,
	groupId,
	contact_id,
	email,
}: {
	organizationId: string;
	groupId: string;
} & ContactModel.RemoveContactFromGroupBody): Promise<ContactModel.RemoveContactFromGroupResponse> {
	const log = useLogger();

	if (!contact_id && !email) {
		throw ContactErrors.invalidEmail("", "Either 'contact_id' or 'email' must be provided");
	}

	log.info("Removing contact from group", {
		contactId: contact_id,
		email: email?.toLowerCase(),
		groupId,
	});

	try {
		// Identify contact
		const whereConditions = [
			eq(schema.contact.organizationId, organizationId),
			isNull(schema.contact.deletedAt),
		];

		if (contact_id) {
			whereConditions.push(eq(schema.contact.id, contact_id));
		} else if (email) {
			whereConditions.push(eq(schema.contact.email, email.toLowerCase()));
		}

		const contact = await db.query.contact.findFirst({
			where: and(...whereConditions),
		});

		if (!contact) {
			throw ContactErrors.contactNotFound(contact_id || email || "");
		}

		// Remove from group
		await db
			.update(schema.contactGroup)
			.set({ deletedAt: new Date(), updatedAt: new Date() })
			.where(
				and(
					eq(schema.contactGroup.contactId, contact.id),
					eq(schema.contactGroup.groupId, groupId),
					eq(schema.contactGroup.organizationId, organizationId),
					isNull(schema.contactGroup.deletedAt),
				),
			);

		log.info("Contact removed from group", {
			contactId: contact.id,
			groupId,
		});

		const result = {
			success: true,
			object: "contact" as const,
			id: contact.id,
			event: CONTACT_UPDATE_WEBHOOK_EVENT.id,
		};

		return result;
	} catch (error) {
		log.error("Error removing contact from group", {
			contactId: contact_id,
			email: email?.toLowerCase(),
			groupId,
			error: error instanceof Error ? error.message : String(error),
		});
		throw error;
	}
}
