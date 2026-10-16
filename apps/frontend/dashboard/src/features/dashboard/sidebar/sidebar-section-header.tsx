import { cn } from "@reloop/ui/cn";

/**
 * Section title that keeps the same height collapsed and expanded, so rows
 * below never jump vertically. Collapsed, the text fades out and a short
 * divider (centered on the 32px nav items) fades in within the same box.
 */
export function SidebarSectionHeader({
	label,
	isCollapsed,
	isFirst,
}: {
	label: string;
	isCollapsed: boolean;
	isFirst: boolean;
}) {
	return (
		<div
			className={cn(
				"relative whitespace-nowrap px-2.5 pt-4 pb-1.5 font-semibold text-[10px] uppercase tracking-[0.06em]",
				isFirst && "pt-1.5",
			)}
		>
			<span
				aria-hidden={isCollapsed || undefined}
				className={cn(
					"block text-text-soft-400 transition-opacity duration-200 ease-in-out",
					isCollapsed && "opacity-0",
				)}
			>
				{label}
			</span>
			{!isFirst && (
				<span
					aria-hidden
					className={cn(
						"absolute top-1/2 left-1 h-px w-6 bg-stroke-soft-200 transition-opacity duration-200 ease-in-out",
						isCollapsed ? "opacity-100" : "opacity-0",
					)}
				/>
			)}
		</div>
	);
}
