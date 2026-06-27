"use client";

import { Icon } from "@reloop/ui/icon";
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
		<div className="mb-1 flex w-full items-center gap-2 rounded-lg border border-[var(--color-primary-base)]/10 bg-[var(--color-primary-base)]/5 px-3 py-2 font-medium text-[var(--color-primary-base)] text-xs dark:border-[var(--color-primary-base)]/20 dark:bg-[var(--color-primary-base)]/10 dark:text-[var(--color-primary-base)]">
			{/* Checkmark icon */}
			<svg
				className="h-3.5 w-3.5 shrink-0"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
			<span className="flex items-center gap-1">
				Sent by{" "}
				<span className="inline-flex items-center gap-0.5 font-semibold">
					<Icon
						name={isAgent ? "robot" : "user"}
						className="h-2.5 w-2.5 shrink-0"
					/>
					{senderLabel}
				</span>{" "}
				at{" "}
				<span className="font-semibold">
					{formatMessageTimestamp(messageAt)}
				</span>
			</span>
		</div>
	);
};
