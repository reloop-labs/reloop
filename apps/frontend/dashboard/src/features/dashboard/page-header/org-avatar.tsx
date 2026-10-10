import { cn } from "@reloop/ui/cn";
import { useState } from "react";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";
import { getAvatarInitial } from "#/utils/avatar";
import { PixelAvatar } from "./pixel-avatar";

const SIZE_CLASS: Record<number, string> = {
	20: "h-5 w-5",
	24: "h-6 w-6",
	28: "h-7 w-7",
	32: "h-8 w-8",
};

/** Workspace logo, falling back to the deterministic pixel avatar. */
export function OrgAvatar({
	org,
	size,
}: {
	org: { id: string; name: string; logo?: string | null };
	size: 20 | 24 | 28 | 32;
}) {
	const [imgError, setImgError] = useState(false);
	const logoSrc = ensureAbsoluteUrl(org.logo);
	const initial = getAvatarInitial(org.name, org.name);
	const dim = SIZE_CLASS[size];

	if (logoSrc && !imgError) {
		return (
			<div
				className={cn(
					"flex flex-shrink-0 items-center justify-center overflow-hidden rounded-lg",
					dim,
				)}
			>
				<img
					src={logoSrc}
					alt={org.name}
					className="h-full w-full object-cover"
					onError={() => setImgError(true)}
					referrerPolicy="no-referrer"
				/>
			</div>
		);
	}

	return (
		<div
			className={cn("relative flex-shrink-0 overflow-hidden rounded-lg", dim)}
		>
			<PixelAvatar seed={org.id} letter={initial} />
		</div>
	);
}
