"use client";

import { cn } from "@reloop/ui/cn";
import { AnimatedWebhookIcon } from "#/features/dashboard/sidebar/animated-webhook-icon";
import { usePlayAnimationOnHover } from "#/features/dashboard/sidebar/use-play-animation-on-hover";

type WebhookAvatarSize = "sm" | "md" | "lg" | "xl";
type WebhookStatus = "active" | "paused" | "disabled" | "failed";

const SIZE_CLASS: Record<
	WebhookAvatarSize,
	{ container: string; pad: string; inner: string; icon: string }
> = {
	sm: {
		container: "h-8 w-8 rounded-lg",
		pad: "p-px",
		inner: "rounded-[5px]",
		icon: "h-3.5 w-3.5",
	},
	md: {
		container: "h-10 w-10 rounded-[12px]",
		pad: "p-0.5",
		inner: "rounded-[9px]",
		icon: "h-4 w-4",
	},
	lg: {
		container: "h-12 w-12 rounded-[14px]",
		pad: "p-0.5",
		inner: "rounded-[11px]",
		icon: "h-5 w-5",
	},
	xl: {
		container: "h-14 w-14 rounded-[16px]",
		pad: "p-0.5",
		inner: "rounded-[13px]",
		icon: "h-6 w-6",
	},
};

const STATUS_TONE: Record<WebhookStatus, { outer: string; icon: string }> = {
	active: {
		outer:
			"border-success-base/25 bg-success-lighter dark:border-success-base/30 dark:bg-success-base/10",
		icon: "text-success-base",
	},
	paused: {
		outer:
			"border-warning-base/25 bg-warning-lighter dark:border-warning-base/30 dark:bg-warning-base/10",
		icon: "text-warning-base",
	},
	disabled: {
		outer:
			"border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]",
		icon: "text-text-sub-600 dark:text-white/80",
	},
	failed: {
		outer:
			"border-error-base/25 bg-error-lighter dark:border-error-base/30 dark:bg-error-base/10",
		icon: "text-error-base",
	},
};

/**
 * Webhook icon inside a two-layer card with sidebar hover animation.
 * Outer frame + icon color follow webhook status.
 */
export function WebhookAvatar({
	size = "lg",
	status = "disabled",
	className,
}: {
	seed?: string;
	size?: WebhookAvatarSize;
	status?: WebhookStatus;
	className?: string;
	alt?: string;
}) {
	const sizeConfig = SIZE_CLASS[size];
	const tone = STATUS_TONE[status] ?? STATUS_TONE.disabled;
	const { groupProps } = usePlayAnimationOnHover();

	return (
		<div
			{...groupProps}
			className={cn(
				"group flex shrink-0 items-center justify-center border",
				sizeConfig.container,
				sizeConfig.pad,
				tone.outer,
				className,
			)}
		>
			<div
				className={cn(
					"flex h-full w-full items-center justify-center bg-bg-white-0 shadow-xs dark:bg-[#0c0c0c]",
					sizeConfig.inner,
				)}
			>
				<AnimatedWebhookIcon className={cn(tone.icon, sizeConfig.icon)} />
			</div>
		</div>
	);
}
