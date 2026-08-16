import { cn } from "@reloop/ui/cn";

export function SectionSeparator({ className }: { className?: string }) {
	return (
		<div
			aria-hidden
			className={cn(
				"h-8 border-stroke-soft-200 border-y sm:h-9 dark:border-white/10",
				className,
			)}
		/>
	);
}
