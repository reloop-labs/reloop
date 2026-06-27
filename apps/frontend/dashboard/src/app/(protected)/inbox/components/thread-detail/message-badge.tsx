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
			<span className="rounded-[4px] bg-[#C4793B]/10 px-1.5 py-[3px] font-medium text-[10px] text-[#C4793B] normal-case tracking-normal dark:text-[#C4793B]">
				needs you
			</span>
		);
	}

	if (variant === "you") {
		return (
			<span className="rounded-[4px] bg-[#6A8068]/10 px-1.5 py-[3px] font-medium text-[10px] text-[#6A8068] normal-case tracking-normal dark:text-[#6A8068]">
				via you
			</span>
		);
	}

	if (variant === "agent") {
		return (
			<span className="rounded-[4px] bg-[#4A6FA5]/10 px-1.5 py-[3px] font-medium text-[10px] text-[#4A6FA5] normal-case tracking-normal dark:text-[#4A6FA5]">
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
