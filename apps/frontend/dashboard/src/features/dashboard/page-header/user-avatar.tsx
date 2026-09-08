import * as Avatar from "@reloop/ui/avatar";
import { cn } from "@reloop/ui/cn";
import { useEffect, useState } from "react";
import { ensureAbsoluteUrl } from "#/utils/absolute-url";
import { PixelAvatar } from "./pixel-avatar";

type AvatarSize = React.ComponentProps<typeof Avatar.Root>["size"];

interface UserAvatarProps {
	name?: string | null;
	email: string;
	image?: string | null;
	size?: AvatarSize;
	className?: string;
	/** Extra classes for the fallback layer (e.g. background tint). */
	initialsClassName?: string;
	alt?: string;
}

/**
 * Stable user avatar: pixel-art identicon always sits under the photo so a
 * failed/slow/expired image URL never leaves an empty circle.
 */
export function UserAvatar({
	name,
	email,
	image,
	size = "24",
	className,
	initialsClassName,
	alt,
}: UserAvatarProps) {
	const [imageFailed, setImageFailed] = useState(false);
	const imageSrc = ensureAbsoluteUrl(image);

	useEffect(() => {
		setImageFailed(false);
	}, [imageSrc]);

	const showImage = Boolean(imageSrc) && !imageFailed;
	const label = alt || name || email;

	return (
		<Avatar.Root
			size={size}
			color="gray"
			className={cn("overflow-hidden", className)}
		>
			<div
				aria-hidden={showImage}
				className={cn(
					"absolute inset-0 h-full w-full",
					initialsClassName,
					showImage && "invisible",
				)}
			>
				<PixelAvatar seed={email || "user"} />
			</div>
			{showImage ? (
				<img
					src={imageSrc}
					alt={label}
					className="relative z-[1] size-full rounded-full object-cover"
					onError={() => setImageFailed(true)}
					referrerPolicy="no-referrer"
				/>
			) : null}
		</Avatar.Root>
	);
}
