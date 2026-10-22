import type {
	Contact,
	SuppressionReason,
	SuppressionSource,
} from "../../hooks/use-contacts-query";

export const SUPPRESSION_REASON_LABEL: Record<SuppressionReason, string> = {
	hard_bounce: "Hard bounce",
	spam_complaint: "Spam complaint",
	mailbox_full: "Mailbox full",
};

/** Only the system sets suppressionReason; a blocked contact without one was suppressed by a person. */
export function getSuppressionSource(contact: Contact): SuppressionSource {
	return (
		contact.suppressionSource ??
		(contact.suppressionReason ? "system" : "manual")
	);
}

/** System reason label, the note a person typed, or "Blocked" for older manual blocks. */
export function getSuppressionReasonText(contact: Contact): string {
	if (contact.suppressionReason) {
		return SUPPRESSION_REASON_LABEL[contact.suppressionReason];
	}
	return contact.suppressionNote || "Blocked";
}
