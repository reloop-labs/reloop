import type { ContactTypes } from "@be/contacts/types/contact.type";

/**
 * Only the system sets suppressionReason (bounces, full mailboxes, spam
 * complaints). A blocked contact without one was suppressed by a person,
 * through the Suppression tab or by setting status to blocked.
 */
export function getSuppressionSource(contact: {
	status: string;
	suppressionReason: string | null;
}): ContactTypes.SuppressionSource | null {
	if (contact.suppressionReason) return "system";
	if (contact.status === "blocked") return "manual";
	return null;
}
