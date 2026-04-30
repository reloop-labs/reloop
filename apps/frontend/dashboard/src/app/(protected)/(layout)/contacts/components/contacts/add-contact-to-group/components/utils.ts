import type { Contact } from "../types";

/**
 * Returns the display name for a contact. Falls back to the email local-part
 * when no first/last name is set.
 */
export const getDisplayName = (contact: Contact): string => {
	if (contact.firstName || contact.lastName) {
		return `${contact.firstName || ""} ${contact.lastName || ""}`.trim();
	}
	return contact.email.split("@")[0] ?? contact.email;
};

/**
 * Returns a single uppercase initial for a contact's avatar.
 */
export const getInitial = (contact: Contact): string =>
	(contact.firstName?.[0] || contact.email?.[0] || "?").toUpperCase();
