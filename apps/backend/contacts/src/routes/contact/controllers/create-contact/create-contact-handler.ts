import type { ContactTypes } from "@be/contacts/types/contact.type";
import { createContact } from "./create-contact";

export async function createContactHandler(
  organizationId: string,
  userId: string,
  body: ContactTypes.CreateContactRequest,
): Promise<ContactTypes.ContactResponse> {
  return createContact(organizationId, userId, body);
}
