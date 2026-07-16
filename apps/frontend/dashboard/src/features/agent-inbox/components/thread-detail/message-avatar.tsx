import { getAvatarInitial } from "#/utils/avatar";
import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";

interface MessageAvatarProps {
	fromEmail: string;
	fromName: string | null;
	isOutbound: boolean;
	isAgent?: boolean;
	size?: "sm" | "md";
}

// Deterministic string hash function for choosing colors
const hashString = (str: string): number => {
	let hash = 5381;
	for (let i = 0; i < str.length; i++) {
		hash = (hash * 33) ^ str.charCodeAt(i);
	}
	return Math.abs(hash);
};

// Premium desaturated light backgrounds with matching dark text colors
const AVATAR_COLORS = [
	{ bg: "bg-[#677E64]/10", text: "text-[#677E64]" }, // Sage Green
	{ bg: "bg-[#3B629B]/10", text: "text-[#3B629B]" }, // Steel Blue
	{ bg: "bg-[#C47839]/10", text: "text-[#C47839]" }, // Amber Orange
	{ bg: "bg-[#8E518E]/10", text: "text-[#8E518E]" }, // Muted Purple
	{ bg: "bg-[#C04C4C]/10", text: "text-[#C04C4C]" }, // Muted Red
	{ bg: "bg-[#4D8C8C]/10", text: "text-[#4D8C8C]" }, // Muted Teal
	{ bg: "bg-[#7A5B9B]/10", text: "text-[#7A5B9B]" }, // Lavender
	{ bg: "bg-[#9A7D3C]/10", text: "text-[#9A7D3C]" }, // Ochre Gold
	{ bg: "bg-[#656E7B]/10", text: "text-[#656E7B]" }, // Slate Gray
	{ bg: "bg-[#4A7F67]/10", text: "text-[#4A7F67]" }, // Forest Green
] as const;

/**
 * Circular avatar showing sender initials with a light background and matching dark text.
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

	// Determine initials
	let initials = "";
	if (isAgent) {
		initials = "AG";
	} else if (isOutbound) {
		initials = "Y";
	} else {
		initials = getAvatarInitial(fromName ?? null, email);
	}

	// Determine theme colors (Agent and Outbound are fixed to brand colors, others are dynamic)
	let bgClass = "bg-[#677E64]/10";
	let textClass = "text-[#677E64]";

	if (isAgent) {
		bgClass = "bg-[#3B629B]/10";
		textClass = "text-[#3B629B]";
	} else if (isOutbound) {
		bgClass = "bg-[#677E64]/10";
		textClass = "text-[#677E64]";
	} else {
		const colorIndex = hashString(email) % AVATAR_COLORS.length;
		const colorPair = AVATAR_COLORS[colorIndex] || AVATAR_COLORS[0];
		bgClass = colorPair.bg;
		textClass = colorPair.text;
	}

	return (
		<Avatar.Root size={dim as any} color="gray" className="shrink-0">
			<Avatar.Image asChild>
				<div
					className={cn(
						"flex h-full w-full items-center justify-center rounded-full font-semibold uppercase tracking-wide",
						size === "sm" ? "text-[10px]" : "text-[11px]",
						bgClass,
						textClass,
					)}
				>
					{initials}
				</div>
			</Avatar.Image>
		</Avatar.Root>
	);
};
