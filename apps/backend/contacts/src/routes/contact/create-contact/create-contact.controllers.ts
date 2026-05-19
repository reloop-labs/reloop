import {
	ContactErrors,
	isAppError,
} from "@be/contacts/error/contacts.error-response";
import type { ContactTypes } from "@be/contacts/types/contact.type";
import { db } from "@reloop/db/client";
import { useLogger } from "evlog/elysia";
import {
	addToGroups_step4,
	checkExistingContact_step1,
	createContact_step2,
	enrollChannels_step5,
	finalizeContactCreation_step6,
	upsertProperties_step3,
} from "./steps";

export async function createContactController({
	organizationId,
	userId,
	email,
	firstName,
	lastName,
	status: contactStatus,
	properties,
	groupIds,
	channels,
}: {
	organizationId: string;
	userId: string;
} & ContactTypes.CreateContactRequest): Promise<ContactTypes.ContactResponse> {
	const log = useLogger();
	try {
		return await db.transaction(async (tx) => {
			// Step 1: Check if contact already exists in this organization (active vs soft-deleted)
			const { softDeletedContact } = await checkExistingContact_step1({
				email,
				organizationId,
				db: tx,
			});

			// Step 2: Create a new contact (or restore soft-deleted contact if found)
			const { newContact } = await createContact_step2({
				email,
				firstName,
				lastName,
				status: contactStatus,
				organizationId,
				userId,
				db: tx,
				softDeletedContact,
			});

			// Step 3: Upsert custom contact properties if provided
			await upsertProperties_step3({
				contactId: newContact.id,
				properties,
				organizationId,
				userId,
				db: tx,
			});

			// Step 4: Associate contact with groups
			await addToGroups_step4({
				contactId: newContact.id,
				groupIds,
				organizationId,
				userId,
				db: tx,
			});

			// Step 5: Enroll contact in communication channels
			await enrollChannels_step5({
				contactId: newContact.id,
				channels,
				organizationId,
				db: tx,
			});

			log.info("Contact created successfully");

			// Step 6: Fetch final unified properties to construct the exact response
			return await finalizeContactCreation_step6({
				newContact,
				organizationId,
				db: tx,
			});
		});
	} catch (error) {
		log.error("Debug creating contact", {
			email: email,
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
