import type { ContactTypes } from "@be/contacts/types/contact.type";
import { logger } from "@reloop/logger";
import { createContact } from "./create-contact";

// Handler for creating multiple contacts at once
export async function createContacts(
  organizationId: string,
  userId: string,
  emails: string[],
): Promise<{ contacts: ContactTypes.ContactResponse[]; skipped: string[] }> {
  logger.info(
    {
      emailCount: emails.length,
      organizationId,
    },
    "Creating multiple contacts",
  );

  const createdContacts: ContactTypes.ContactResponse[] = [];
  const skippedEmails: string[] = [];

  for (const email of emails) {
    try {
      const contact = await createContact(organizationId, userId, { email });
      createdContacts.push(contact);
    } catch {
      // If contact already exists, skip it
      skippedEmails.push(email);
    }
  }

  logger.info(
    {
      created: createdContacts.length,
      skipped: skippedEmails.length,
      organizationId,
    },
    "Multiple contacts creation completed",
  );

  return { contacts: createdContacts, skipped: skippedEmails };
}
