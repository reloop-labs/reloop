import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function createContact_step2({
	email,
	firstName,
	lastName,
	status,
	organizationId,
	userId,
	db,
	softDeletedContact,
}: {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	status?: "subscribed" | "unsubscribed" | "blocked" | null;
	organizationId: string;
	userId: string;
	db: DatabaseInstance;
	softDeletedContact?: typeof schema.contact.$inferSelect | null;
}) {
	const log = useLogger();

	if (softDeletedContact) {
		log.info("Soft-deleted contact found, restoring it");
		const [restoredContact] = await db
			.update(schema.contact)
			.set({
				deletedAt: null,
				firstName: firstName || null,
				lastName: lastName || null,
				status: (status || "subscribed") as
					| "subscribed"
					| "unsubscribed"
					| "blocked",
				updatedAt: new Date(),
			})
			.where(eq(schema.contact.id, softDeletedContact.id))
			.returning();

		if (!restoredContact) {
			log.error("Failed to restore contact - no data returned");
			throw ContactErrors.createFailed();
		}
		log.info("Contact restored successfully");
		return { newContact: restoredContact };
	}

	log.warn("Contact not found, creating new contact");
	const [newContact] = await db
		.insert(schema.contact)
		.values({
			email: email,
			firstName: firstName || null,
			lastName: lastName || null,
			status: (status || "subscribed") as
				| "subscribed"
				| "unsubscribed"
				| "blocked",
			organizationId,
			userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		})
		.returning();

	if (!newContact) {
		log.error("Failed to create contact - no data returned");
		throw ContactErrors.createFailed();
	}
	log.info("Contact added");
	return { newContact };
}
