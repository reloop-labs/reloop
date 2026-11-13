export type CampaignStatus =
	| "draft"
	| "scheduled"
	| "sending"
	| "sent"
	| "cancelled";

/** Scheduled campaigns stay editable until the send starts. */
export function canEdit(status: CampaignStatus): boolean {
	return status === "draft" || status === "scheduled";
}

export function canSend(status: CampaignStatus): boolean {
	return status === "draft" || status === "scheduled";
}

export function canSchedule(status: CampaignStatus): boolean {
	return status === "draft" || status === "scheduled";
}

/** A sending campaign can be re-queued when its send loop stalled. */
export function canResume(status: CampaignStatus): boolean {
	return status === "sending";
}

export function canCancel(status: CampaignStatus): boolean {
	return status === "scheduled" || status === "sending";
}

export function canDelete(status: CampaignStatus): boolean {
	return status === "draft" || status === "cancelled";
}
