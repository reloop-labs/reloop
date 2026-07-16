export type AudienceStatus = "subscribed" | "unsubscribed" | "blocked";

export const getStatusLabel = (status: AudienceStatus | string): string => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "Subscribed";
		case "unsubscribed":
			return "Unsubscribed";
		case "blocked":
			return "Blocked";
		default:
			return status;
	}
};

export const getStatusColorClass = (status: AudienceStatus | string): string => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "text-success-base";
		case "unsubscribed":
		case "blocked":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
};

export const getStatusIcon = (status: AudienceStatus | string): string => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "check-circle";
		case "unsubscribed":
		case "blocked":
			return "minus-circle";
		default:
			return "minus-circle";
	}
};

export const getFullName = (
	firstName: string | null,
	lastName: string | null,
): string => {
	const first = firstName?.trim() || "";
	const last = lastName?.trim() || "";
	if (!first && !last) return "";
	if (!first) return last;
	if (!last) return first;
	return `${first} ${last}`;
};

export const getDisplayName = (
	firstName: string | null,
	lastName: string | null,
	email: string,
): string => getFullName(firstName, lastName) || email;
