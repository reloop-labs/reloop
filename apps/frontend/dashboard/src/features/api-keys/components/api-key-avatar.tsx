import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";

type ApiKeyAvatarSize = "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<
	ApiKeyAvatarSize,
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

/**
 * Key icon inside a two-layer card (soft outer frame + inset white panel),
 * matching the Create Contact / HomeCardShell surface at icon scale.
 */
export function ApiKeyAvatar({
	size = "lg",
	className,
}: {
	seed?: string;
	size?: ApiKeyAvatarSize;
	className?: string;
	alt?: string;
}) {
	const sizeConfig = SIZE_CLASS[size];

	return (
		<div
			className={cn(
				"flex shrink-0 items-center justify-center border border-stroke-soft-200 bg-bg-soft-50 dark:border-stroke-soft-100/40 dark:bg-white/[0.03]",
				sizeConfig.container,
				sizeConfig.pad,
				className,
			)}
		>
			<div
				className={cn(
					"flex h-full w-full items-center justify-center bg-bg-white-0 shadow-xs dark:bg-[#0c0c0c]",
					sizeConfig.inner,
				)}
			>
				<Icon
					name="key-new"
					className={cn(
						"text-text-sub-600 dark:text-white/80",
						sizeConfig.icon,
					)}
				/>
			</div>
		</div>
	);
}
