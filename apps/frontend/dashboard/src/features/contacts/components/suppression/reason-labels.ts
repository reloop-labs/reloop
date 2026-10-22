import type { SuppressionReason } from "../../hooks/use-contacts-query";

export const SUPPRESSION_REASON_LABEL: Record<SuppressionReason, string> = {
	hard_bounce: "Hard bounce",
	spam_complaint: "Spam complaint",
	mailbox_full: "Mailbox full",
};
