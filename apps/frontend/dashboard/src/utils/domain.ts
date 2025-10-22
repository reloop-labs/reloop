import type { DomainStatus } from "@reloop/api/types";

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
		case "start-verify":
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
		case "start-verify":
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
		case "start-verify":
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
