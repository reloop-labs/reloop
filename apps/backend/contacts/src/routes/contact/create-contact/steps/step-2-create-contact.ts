import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { DatabaseInstance } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { useLogger } from "evlog/elysia";

export async function createContact_step2({
	email,
	firstName,
	lastName,
	status,
	organizationId,
	userId,
	db,
}: {
	email: string;
	firstName?: string | null;
	lastName?: string | null;
	status?: "subscribed" | "unsubscribed" | "blocked" | null;
	organizationId: string;
	userId: string;
	db: DatabaseInstance;
}) {
	const log = useLogger();
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
