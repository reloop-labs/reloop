import type { CampaignStatus } from "./campaign-types";

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
