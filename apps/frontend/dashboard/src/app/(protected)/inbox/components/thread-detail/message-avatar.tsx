"use client";

import {
	getAvatarGradient,
	getAvatarInitial,
} from "@fe/dashboard/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";

interface MessageAvatarProps {
	fromEmail: string;
	fromName: string | null;
	isOutbound: boolean;
	isAgent?: boolean;
	size?: "sm" | "md";
}

/**
 * Circular avatar showing sender initials with a colour-coded gradient.
 * Generated dynamically from the email address and name.
 */
export const MessageAvatar = ({
	fromEmail,
	fromName,
	isOutbound,
	isAgent,
	size = "md",
}: MessageAvatarProps) => {
	const dim = size === "sm" ? "28" : "32";
	const email = fromEmail || "default";

	return (
		<Avatar.Root size={dim as any} color="gray" className="shrink-0">
			<Avatar.Image asChild>
				<div
					className={cn(
						"flex h-full w-full items-center justify-center rounded-full font-semibold uppercase tracking-wide shadow-sm text-white",
						size === "sm" ? "text-[10px]" : "text-[11px]",
						getAvatarGradient(email),
					)}
				>
					{getAvatarInitial(fromName ?? null, email)}
				</div>
			</Avatar.Image>
		</Avatar.Root>
	);
};
