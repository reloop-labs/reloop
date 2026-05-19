import { ContactErrors } from "@be/contacts/error/contacts.error-response";
import type { DatabaseInstance } from "@reloop/db/client";
import { useLogger } from "evlog/elysia";
import { getExistingContact } from "../get-existing-contact";

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
	const existingContact = await getExistingContact({
		email,
		organizationId,
		db,
	});
	if (existingContact) {
		log.warn("Contact already exists in this organization");
		throw ContactErrors.contactAlreadyExists(email);
	}
}
