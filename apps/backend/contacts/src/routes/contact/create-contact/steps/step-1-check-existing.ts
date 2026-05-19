import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function checkExistingContact_step1({
	email,
	organizationId,
	db,
}: {
	email: string;
	organizationId: string;
	db: DatabaseInstance;
}) {
	const log = useLogger();

	// Check for an active contact
	const activeContactList = await db
		.select()
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.email, email),
				eq(schema.contact.organizationId, organizationId),
				isNull(schema.contact.deletedAt),
			),
		)
		.limit(1);

	const activeContact = activeContactList[0] || null;

	if (activeContact) {
		log.warn("Contact already exists in this organization");
		throw ContactErrors.contactAlreadyExists(email);
	}

	// Check for a soft-deleted contact
	const softDeletedContactList = await db
		.select()
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.email, email),
				eq(schema.contact.organizationId, organizationId),
				isNotNull(schema.contact.deletedAt),
			),
		)
		.limit(1);

	const softDeletedContact = softDeletedContactList[0] || null;

	return { softDeletedContact };
}
