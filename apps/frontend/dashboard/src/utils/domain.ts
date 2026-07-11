import type { DomainStatus } from "@fe/dashboard/types/api.types";

// Re-export for backward compatibility
export type { DomainStatus };

/**
 * Get human-readable label for domain status
 */
export const getStatusLabel = (status: DomainStatus): string => {
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
};

/**
 * Get CSS color class for domain status
 */
export const getStatusColorClass = (status: DomainStatus): string => {
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
};

/**
 * Get icon name for domain status
 */
export const getStatusIcon = (status: DomainStatus): string => {
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
};

/**
 * Get animation properties for staggered animations
 */
export const getAnimationProps = (row: number, column: number) => {
	return {
		initial: { opacity: 0, y: "-100%" },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: "100%" },
		transition: {
			duration: 0.5,
			delay: row * 0.07 + column * 0.1,
			ease: [0.65, 0, 0.35, 1] as const,
		},
	};
};

/**
 * Extract root domain from a domain name (simple version)
 */
export const getRootDomain = (domain: string): string => {
	if (!domain) return "";
	const parts = domain.split(".");
	if (parts.length <= 2) return domain;
	return parts.slice(-2).join(".");
};

function formatFailedRecords(names: string[]): string {
	if (names.length === 1) {
		return `Your ${names[0]} record is missing or incorrect`;
	}
	const last = names[names.length - 1];
	const rest = names.slice(0, -1).join(", ");
	return `Your ${rest}, and ${last} records are missing or incorrect`;
}

/**
 * Normalize stored failure reasons (including legacy DKIM=false dumps) for display.
 */
export const formatVerificationFailedReason = (reason: string): string => {
	const legacyMatches = [...reason.matchAll(/([A-Z]+)=false/g)]
		.map((match) => match[1])
		.filter((name): name is string => name !== undefined);
	if (legacyMatches.length > 0) {
		return formatFailedRecords(legacyMatches);
	}
	return reason;
};

/**
 * Banner / tooltip copy for a failed domain verification.
 */
export const getVerificationFailedMessage = (
	reason?: string | null,
): string => {
	if (!reason) {
		return "We couldn't verify your domain. Double-check your DNS records and try again.";
	}
	return `We couldn't verify your domain — ${formatVerificationFailedReason(reason)}. Double-check your DNS records and try again.`;
};
