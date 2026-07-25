import { createAvatar } from "@dicebear/core";
import * as shapes from "@dicebear/shapes";
import { cn } from "@reloop/ui/cn";
import { useMemo } from "react";

type WebhookAvatarSize = "sm" | "md" | "lg";

const SIZE_PX: Record<WebhookAvatarSize, number> = {
	sm: 28,
	md: 40,
	lg: 48,
};

const SIZE_CLASS: Record<WebhookAvatarSize, string> = {
	sm: "h-7 w-7 rounded-lg",
	md: "h-10 w-10 rounded-[12px]",
	lg: "h-12 w-12 rounded-[14px]",
};

/**
 * Deterministic DiceBear "shapes" avatar for a webhook seed (id preferred).
 */
export function WebhookAvatar({
	seed,
	size = "md",
	className,
	alt = "Webhook avatar",
}: {
	seed: string;
	size?: WebhookAvatarSize;
	className?: string;
	alt?: string;
}) {
	const src = useMemo(() => {
		const px = SIZE_PX[size];
		return createAvatar(shapes, {
			seed: seed || "webhook",
			size: px,
			// Soft, rounded geometric look similar to the product reference
			radius: 20,
		}).toDataUri();
	}, [seed, size]);

	return (
		<img
			src={src}
			alt={alt}
			width={SIZE_PX[size]}
			height={SIZE_PX[size]}
			draggable={false}
			className={cn(
				"shrink-0 select-none bg-bg-weak-50 ring-1 ring-stroke-soft-100/80 dark:ring-stroke-soft-100/40",
				SIZE_CLASS[size],
				className,
			)}
		/>
	);
}
