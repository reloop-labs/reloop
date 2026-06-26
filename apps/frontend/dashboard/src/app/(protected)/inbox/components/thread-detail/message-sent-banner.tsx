"use client";

import { formatMessageTimestamp } from "./date-utils";

interface MessageSentBannerProps {
	messageAt: string;
	isAgent: boolean;
}

/**
 * Green banner indicating successful send status.
 * Matches: "✓ Sent by agent at Mon, 2:10 PM"
 */
export const MessageSentBanner = ({
	messageAt,
	isAgent,
}: MessageSentBannerProps) => {
	const senderLabel = isAgent ? "agent" : "you";

	return (
		<div className="w-full mb-1 flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2 font-medium text-emerald-700 text-xs dark:border-emerald-500/20 dark:bg-emerald-950/20 dark:text-emerald-400">
			{/* Checkmark icon */}
			<svg
				className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
			<span>
				Sent by <span className="font-semibold">{senderLabel}</span> at{" "}
				<span className="font-semibold">{formatMessageTimestamp(messageAt)}</span>
			</span>
		</div>
	);
};
