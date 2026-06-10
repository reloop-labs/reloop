"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
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

const filterIcons: Record<InboxFilter, string> = {
	all: "inbox",
	spam: "cross-circle",
};

export const InboxFilterTabs = ({
	activeFilter,
	onFilterChange,
	counts,
	orientation = "horizontal",
	className,
}: InboxFilterTabsProps) => {
	const isVertical = orientation === "vertical";

	if (isVertical) {
		const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
		const buttonRefs = useRef<HTMLButtonElement[]>([]);

		const activeIdx = INBOX_FILTERS.findIndex((f) => f.id === activeFilter);
		const activeEl = buttonRefs.current[activeIdx];
		const currentEl =
			hoveredIdx !== undefined ? buttonRefs.current[hoveredIdx] : activeEl;
		const currentRect = currentEl?.getBoundingClientRect();

		return (
			<nav
				className={cn(
					"relative flex w-full shrink-0 flex-col gap-0.5",
					className,
				)}
				aria-label="Inbox filters"
			>
				<p className="mb-2 px-2 font-medium text-label-xs text-text-soft-400">
					Filters
				</p>
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
								"relative z-10 flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left font-medium text-sm transition-all",
								isActive
									? "text-text-strong-950"
									: "text-text-sub-600 hover:text-text-strong-950",
							)}
						>
							<span className="truncate">{filter.label}</span>
							<span
								className={cn(
									"shrink-0 text-label-xs tabular-nums",
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
	}

	return (
		<nav
			className={cn(
				"flex w-full items-center gap-6 border-b border-stroke-soft-100 dark:border-stroke-soft-100/40",
				className,
			)}
			aria-label="Inbox filters"
		>
			{INBOX_FILTERS.map((filter) => {
				const isActive = activeFilter === filter.id;
				const iconName = filterIcons[filter.id];
				const count = counts[filter.id];
				return (
					<button
						key={filter.id}
						type="button"
						onClick={() => onFilterChange(filter.id)}
						className={cn(
							"relative -mb-[1px] flex items-center gap-2 border-b-2 px-1 pt-2 pb-3 font-semibold text-xs transition-colors focus:outline-none",
							isActive
								? "border-primary-base text-primary-base dark:text-[#5293eb]"
								: "border-transparent text-text-sub-600 hover:text-text-strong-950",
						)}
					>
						<Icon name={iconName} className="h-4 w-4" />
						<span className="capitalize">{filter.label.replace("_", " ")}</span>
						{count > 0 && (
							<span
								className={cn(
									"shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold transition-colors",
									isActive
										? "bg-primary-base/10 text-primary-base dark:bg-[#5293eb]/10 dark:text-[#5293eb]"
										: "bg-bg-weak-50 text-text-soft-400 dark:bg-white/10",
								)}
							>
								{count}
							</span>
						)}
					</button>
				);
			})}
		</nav>
	);
};
