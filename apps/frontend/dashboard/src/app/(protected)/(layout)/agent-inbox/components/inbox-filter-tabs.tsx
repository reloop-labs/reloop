"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import { useRef, useState } from "react";
import type { InboxFilter } from "../mock-data";
import { INBOX_FILTERS } from "../mock-data";

interface InboxFilterTabsProps {
	activeFilter: InboxFilter;
	onFilterChange: (filter: InboxFilter) => void;
	counts: Record<InboxFilter, number>;
	orientation?: "horizontal" | "vertical";
	className?: string;
}

export const InboxFilterTabs = ({
	activeFilter,
	onFilterChange,
	counts,
	orientation = "horizontal",
	className,
}: InboxFilterTabsProps) => {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIdx = INBOX_FILTERS.findIndex((f) => f.id === activeFilter);
	const activeEl = buttonRefs.current[activeIdx];
	const currentEl =
		hoveredIdx !== undefined ? buttonRefs.current[hoveredIdx] : activeEl;
	const currentRect = currentEl?.getBoundingClientRect();

	const isVertical = orientation === "vertical";

	return (
		<nav
			className={cn(
				"relative",
				isVertical
					? "flex w-full shrink-0 flex-col gap-0.5"
					: "flex flex-wrap items-center gap-2 py-3",
				className,
			)}
			aria-label="Inbox filters"
		>
			{isVertical && (
				<p className="mb-2 px-2 font-medium text-label-xs text-text-soft-400">
					Filters
				</p>
			)}
			{INBOX_FILTERS.map((filter, idx) => {
				const isActive = activeFilter === filter.id;
				return (
					<button
						key={filter.id}
						ref={(el) => {
							if (el) buttonRefs.current[idx] = el;
						}}
						type="button"
						onPointerEnter={() => setHoveredIdx(idx)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						onClick={() => onFilterChange(filter.id)}
						className={cn(
							"relative z-10 flex items-center justify-between gap-2 rounded-lg text-left font-medium text-sm transition-all",
							isVertical ? "w-full px-2.5 py-2" : "inline-flex px-3 py-1",
							isActive
								? "text-text-strong-950"
								: "text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						<span className="truncate">{filter.label}</span>
						<span
							className={cn(
								"shrink-0 tabular-nums text-label-xs",
								isActive ? "text-text-sub-600" : "text-text-soft-400",
							)}
						>
							{counts[filter.id]}
						</span>
					</button>
				);
			})}
			<AnimatedHoverBackground
				rect={currentRect}
				tabElement={currentEl}
				className="bg-bg-weak-50 ring-1 ring-stroke-soft-100 dark:bg-bg-weak-50/20 dark:ring-stroke-soft-100/40"
			/>
		</nav>
	);
};
