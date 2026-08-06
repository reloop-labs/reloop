import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

type WebhookAvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<
	WebhookAvatarSize,
	{ container: string; icon: string }
> = {
	sm: {
		container: "h-8 w-8 rounded-lg",
		icon: "h-4 w-4",
	},
	md: {
		container: "h-10 w-10 rounded-[12px]",
		icon: "h-5 w-5",
	},
	lg: {
		container: "h-12 w-12 rounded-[14px]",
		icon: "h-6 w-6",
	},
	xl: {
		container: "h-14 w-14 rounded-[16px]",
		icon: "h-7 w-7",
	},
};

/**
 * Webhook icon inside a bordered card container (matches DomainAvatar).
 */
export function WebhookAvatar({
	size = "lg",
	className,
}: {
	seed?: string;
	size?: WebhookAvatarSize;
	className?: string;
	alt?: string;
}) {
	const sizeConfig = SIZE_CLASS[size];

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-weak-50/20",
				sizeConfig.container,
				className,
			)}
		>
			<Icon
				name="webhook"
				className={cn("text-text-sub-600 dark:text-white/80", sizeConfig.icon)}
			/>
		</div>
	);
}
