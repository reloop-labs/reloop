/**
 * Shared types and utilities for the contacts feature
 */

// ============================================================================
// Types
// ============================================================================

export interface Contact {
	id: string;
	email: string;
	status: string;
	firstName: string | null;
	lastName: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface Property {
	id: string;
	name: string;
	type: string;
	fallbackValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

export interface PropertyValueWithName {
	id: string;
	propertyId: string;
	value: string;
	name: string;
	createdAt: string;
	updatedAt: string;
}

// ============================================================================
// Status Utilities
// ============================================================================

export const getStatusColor = (status: string): string => {
	return status.toLowerCase() === "subscribed"
		? "text-success-base"
		: "text-error-base";
};

export const getStatusIcon = (
	status: string,
): "check-circle" | "cross-circle" => {
	return status.toLowerCase() === "subscribed"
		? "check-circle"
		: "cross-circle";
};

export const getStatusBadgeStyles = (status: string): string => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "border border-success-base text-success-base bg-success-light/20";
		case "unsubscribed":
			return "border border-error-base text-error-base bg-error-light/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

export const formatStatusLabel = (status: string): string => {
	switch (status.toLowerCase()) {
		case "subscribed":
			return "Subscribed";
		case "unsubscribed":
			return "Unsubscribed";
		default:
			return status;
	}
};

// ============================================================================
// Animation Utilities
// ============================================================================

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

// ============================================================================
// Property Type Utilities
// ============================================================================

export const getTypeBadgeStyles = (type: string): string => {
	switch (type.toLowerCase()) {
		case "string":
			return "border border-primary-base text-primary-base bg-primary-light/20";
		case "number":
			return "border border-violet-500 text-violet-600 bg-violet-100/20";
		default:
			return "border border-stroke-soft-200 text-text-sub-600 bg-neutral-alpha-10";
	}
};

// ============================================================================
// Format Utilities
// ============================================================================

/**
 * Convert camelCase to Title Case (e.g., "firstName" -> "FIRST NAME")
 */
export const formatPropertyName = (name: string): string => {
	return name
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, (str) => str.toUpperCase())
		.toUpperCase()
		.trim();
};
