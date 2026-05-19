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
			const { softDeletedContact } = await checkExistingContact_step1({
				email,
				organizationId,
				db: tx,
			});

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

			await upsertProperties_step3({
				contactId: newContact.id,
				properties,
				organizationId,
				userId,
				db: tx,
			});

			await addToGroups_step4({
				contactId: newContact.id,
				groupIds,
				organizationId,
				userId,
				db: tx,
			});

			await enrollChannels_step5({
				contactId: newContact.id,
				channels,
				organizationId,
				db: tx,
			});

			log.info("Contact created successfully");

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
