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
	size?: "sm" | "md";
}

/**
 * Circular avatar showing sender initials with a colour-coded gradient.
 * Outbound messages always show "ME" on a green background.
 */
export const MessageAvatar = ({
	fromEmail,
	fromName,
	isOutbound,
	size = "md",
}: MessageAvatarProps) => {
	const dim = size === "sm" ? "28" : "32";

	return (
		<Avatar.Root size={dim as any} color="gray" className="shrink-0">
			<Avatar.Image asChild>
				<div
					className={cn(
						"flex h-full w-full items-center justify-center rounded-full font-semibold text-[11px] text-white uppercase tracking-wide shadow-sm",
						isOutbound
							? "bg-emerald-600"
							: getAvatarGradient(fromEmail || "default"),
					)}
				>
					{isOutbound
						? "ME"
						: getAvatarInitial(fromName ?? null, fromEmail || "U")}
				</div>
			</Avatar.Image>
		</Avatar.Root>
	);
};
