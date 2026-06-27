"use client";

type BadgeVariant = "agent" | "you" | "approval" | null;

interface MessageBadgeProps {
	variant: BadgeVariant;
}

/**
 * Coloured pill label indicating who authored the message.
 * Matches the screenshot badges: "via agent", "via you", and approval state.
 */
export const MessageBadge = ({ variant }: MessageBadgeProps) => {
	if (!variant) return null;

	if (variant === "approval") {
		return (
			<span className="rounded-[4px] bg-amber-500/10 px-1.5 py-[3px] font-medium text-[10px] text-amber-700 normal-case tracking-normal dark:text-amber-400">
				needs you
			</span>
		);
	}

	if (variant === "you") {
		return (
			<span className="rounded-[4px] bg-emerald-500/10 px-1.5 py-[3px] font-medium text-[10px] text-emerald-700 normal-case tracking-normal dark:text-emerald-400">
				via you
			</span>
		);
	}

	if (variant === "agent") {
		return (
			<span className="rounded-[4px] bg-blue-500/10 px-1.5 py-[3px] font-medium text-[10px] text-blue-700 normal-case tracking-normal dark:text-blue-400">
				via agent
			</span>
		);
	}

	return null;
};

/** Derive the badge variant from message flags */
export const getBadgeVariant = (
	isApproval: boolean,
	isOutbound: boolean,
	isAgent: boolean,
): BadgeVariant => {
	if (isAgent) return "agent";
	if (isOutbound) return "you";
	if (isApproval) return "approval";
	return null;
};
