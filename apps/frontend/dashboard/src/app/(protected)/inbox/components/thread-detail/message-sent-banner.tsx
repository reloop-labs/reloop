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
		<div className="mb-1 flex w-full items-center gap-2 rounded-lg border border-[#677E64]/10 bg-[#677E64]/5 px-3 py-2 font-medium text-[#677E64] text-xs dark:border-[#677E64]/20 dark:bg-[#677E64]/10 dark:text-[#677E64]">
			{/* Checkmark icon */}
			<svg
				className="h-3.5 w-3.5 shrink-0 text-[#677E64] dark:text-[#677E64]"
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
				<span className="font-semibold">
					{formatMessageTimestamp(messageAt)}
				</span>
			</span>
		</div>
	);
};
