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
			<span className="rounded-[4px] bg-[#C47839]/10 px-1.5 py-[3px] font-medium text-[10px] text-[#C47839] normal-case tracking-normal dark:text-[#C47839]">
				needs you
			</span>
		);
	}

	if (variant === "you") {
		return (
			<span className="rounded-[4px] bg-[#677E64]/10 px-1.5 py-[3px] font-medium text-[10px] text-[#677E64] normal-case tracking-normal dark:text-[#677E64]">
				via you
			</span>
		);
	}

	if (variant === "agent") {
		return (
			<span className="rounded-[4px] bg-[#3B629B]/10 px-1.5 py-[3px] font-medium text-[10px] text-[#3B629B] normal-case tracking-normal dark:text-[#3B629B]">
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
