import { cn } from "@reloop/ui/cn";

export function SectionSeparator({
	className,
	hideTop = false,
	hideTopBorder = false,
	hideBottom = false,
	hideBottomBorder = false,
}: {
	className?: string;
	hideTop?: boolean;
	hideTopBorder?: boolean;
	hideBottom?: boolean;
	hideBottomBorder?: boolean;
}) {
	const shouldHideTop = hideTop || hideTopBorder;
	const shouldHideBottom = hideBottom || hideBottomBorder;

	return (
		<div
			aria-hidden
			className={cn(
				"h-8 border-stroke-soft-200 sm:h-9 dark:border-white/10",
				shouldHideTop && shouldHideBottom
					? "border-y-0"
					: shouldHideTop
						? "border-b border-t-0"
						: shouldHideBottom
							? "border-t border-b-0"
							: "border-y",
				className,
			)}
		/>
	);
}
