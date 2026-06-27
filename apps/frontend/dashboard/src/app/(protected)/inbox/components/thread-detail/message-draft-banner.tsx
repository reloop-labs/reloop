"use client";

import dayjs from "dayjs";

interface MessageDraftBannerProps {
	messageAt: string;
}

/**
 * Amber warning banner shown on approval-pending messages.
 * Matches: "Agent drafted a reply at Today, 10:44 AM · held for your approval before sending"
 */
export const MessageDraftBanner = ({ messageAt }: MessageDraftBannerProps) => {
	const timeLabel = dayjs(messageAt).isSame(dayjs(), "day")
		? `Today, ${dayjs(messageAt).format("h:mm A")}`
		: dayjs(messageAt).format("MMM D, h:mm A");

	return (
		<div className="mb-1 flex w-full items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 font-medium text-amber-700 text-xs dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400">
			{/* Clock icon */}
			<svg
				className="h-3.5 w-3.5 shrink-0 text-amber-500"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="2"
			>
				<circle cx="12" cy="12" r="10" />
				<polyline points="12 6 12 12 16 14" />
			</svg>
			<span>
				Agent drafted a reply at{" "}
				<span className="font-semibold">{timeLabel}</span>
				<span className="mx-1.5 opacity-50">·</span>
				held for your approval before sending
			</span>
		</div>
	);
};
