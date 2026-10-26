import type { AudienceTargetType, CampaignStatus } from "./campaign-types";

export const getStatusLabel = (status: CampaignStatus): string => {
	switch (status) {
		case "draft":
			return "Draft";
		case "scheduled":
			return "Scheduled";
		case "sending":
			return "Sending";
		case "sent":
			return "Sent";
		case "cancelled":
			return "Cancelled";
		default:
			return status;
	}
};

export const getStatusColorClass = (status: CampaignStatus): string => {
	switch (status) {
		case "scheduled":
			return "text-warning-base";
		case "sending":
			return "text-blue-500";
		case "sent":
			return "text-success-base";
		case "cancelled":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
};

export const getStatusIcon = (status: CampaignStatus): string => {
	switch (status) {
		case "draft":
			return "minus-circle";
		case "scheduled":
			return "time";
		case "sending":
			return "refresh-cw";
		case "sent":
			return "check-circle";
		case "cancelled":
			return "cross-circle";
		default:
			return "minus-circle";
	}
};

export const getAudienceIcon = (type?: AudienceTargetType): string => {
	switch (type) {
		case "group":
			return "modules";
		case "channel":
			return "notification-indicator";
		case "csv":
			return "file-text";
		default:
			return "contacts";
	}
};

/** Drafts and scheduled campaigns stay editable until the send starts. */
export function isEditableStatus(status: string | undefined | null): boolean {
	return status === "draft" || status === "scheduled";
}

/** Don't offer a schedule slot that starts in the next few minutes. */
const MIN_SCHEDULE_LEAD_MS = 5 * 60_000;

/** Next local occurrence of a weekday (0 = Monday) at the top of an hour. */
export function nextSlot(day: number, hour: number, now = new Date()): Date {
	const slot = new Date(now);
	slot.setHours(hour, 0, 0, 0);
	const today = (now.getDay() + 6) % 7;
	slot.setDate(slot.getDate() + ((day - today + 7) % 7));
	if (slot.getTime() < now.getTime() + MIN_SCHEDULE_LEAD_MS) {
		slot.setDate(slot.getDate() + 7);
	}
	return slot;
}
