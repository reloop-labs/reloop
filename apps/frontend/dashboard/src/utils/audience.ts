import type { AudienceStatus } from "@reloop/api/types";

// Re-export for backward compatibility
export type { AudienceStatus };

/**
 * Get human-readable label for audience status
 */
export const getStatusLabel = (status: AudienceStatus): string => {
    switch (status) {
        case "subscribed":
            return "Subscribed";
        case "unsubscribed":
            return "Unsubscribed";
        default:
            return status;
    }
};

/**
 * Get CSS color class for audience status
 */
export const getStatusColorClass = (status: AudienceStatus): string => {
    switch (status) {
        case "subscribed":
            return "text-success-base";
        case "unsubscribed":
            return "text-text-sub-600";
        default:
            return "text-text-sub-600";
    }
};

/**
 * Get icon name for audience status
 */
export const getStatusIcon = (status: AudienceStatus): string => {
    switch (status) {
        case "subscribed":
            return "check-circle";
        case "unsubscribed":
            return "minus-circle";
        default:
            return "minus-circle";
    }
};


/**
 * Get full name from first and last name
 */
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

/**
 * Get display name for audience (full name or email)
 */
export const getDisplayName = (
    firstName: string | null,
    lastName: string | null,
    email: string,
): string => {
    const fullName = getFullName(firstName, lastName);
    return fullName || email;
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
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
};


/**
 * Format metadata for display
 */
export const formatMetadata = (
    metadata: Record<string, unknown> | null,
): string => {
    if (!metadata || Object.keys(metadata).length === 0) {
        return "No metadata";
    }

    try {
        return JSON.stringify(metadata, null, 2);
    } catch {
        return "Invalid metadata";
    }
};

/**
 * Parse metadata from string
 */
export const parseMetadata = (
    metadataString: string,
): Record<string, unknown> | null => {
    if (!metadataString.trim()) return null;

    try {
        return JSON.parse(metadataString);
    } catch {
        return null;
    }
};
