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
			<span className="rounded bg-amber-500/10 px-2 py-0.5 font-semibold text-[10px] text-amber-700 dark:text-amber-400 normal-case tracking-normal">
				needs you
			</span>
		);
	}

	if (variant === "you") {
		return (
			<span className="rounded bg-emerald-500/10 px-2 py-0.5 font-semibold text-[10px] text-emerald-700 dark:text-emerald-400 normal-case tracking-normal">
				via you
			</span>
		);
	}

	if (variant === "agent") {
		return (
			<span className="rounded bg-blue-500/10 px-2 py-0.5 font-semibold text-[10px] text-blue-700 dark:text-blue-400 normal-case tracking-normal">
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
	if (isApproval) return "approval";
	if (isOutbound) return "you";
	if (isAgent) return "agent";
	return null;
};
