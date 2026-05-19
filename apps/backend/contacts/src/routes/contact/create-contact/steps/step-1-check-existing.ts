import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq } from "drizzle-orm";
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

	// Single query — fetch up to 2 rows (active + soft-deleted) matching this email.
	// Partitioning in JS avoids the second round-trip.
	const rows = await db
		.select()
		.from(schema.contact)
		.where(
			and(
				eq(schema.contact.email, email),
				eq(schema.contact.organizationId, organizationId),
			),
		)
		.limit(2);

	const activeContact = rows.find((r) => r.deletedAt === null) ?? null;
	const softDeletedContact = rows.find((r) => r.deletedAt !== null) ?? null;

	if (activeContact) {
		log.warn("Contact already exists in this organization");
		throw ContactErrors.contactAlreadyExists(email);
	}

	return { softDeletedContact };
}
