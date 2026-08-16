export type DomainStatus =
	| "pending"
	| "verifying"
	| "active"
	| "suspended"
	| "failed";

export function getStatusLabel(status: DomainStatus): string {
	switch (status) {
		case "active":
			return "Active";
		case "verifying":
			return "Verifying";
		case "pending":
			return "Not Started";
		case "suspended":
			return "Suspended";
		case "failed":
			return "Failed";
		default:
			return status;
	}
}

export function getStatusColorClass(status: DomainStatus): string {
	switch (status) {
		case "pending":
			return "text-text-sub-600";
		case "verifying":
			return "text-warning-base";
		case "active":
			return "text-success-base";
		case "failed":
		case "suspended":
			return "text-error-base";
		default:
			return "text-text-sub-600";
	}
}

export function getStatusIcon(status: DomainStatus): string {
	switch (status) {
		case "pending":
			return "minus-circle";
		case "verifying":
			return "time";
		case "active":
			return "check-circle";
		case "failed":
			return "cross-circle";
		default:
			return "minus-circle";
	}
}
