"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import type { InboxFilter } from "../types";
import { INBOX_FILTERS } from "../types";

interface InboxFilterTabsProps {
	activeFilter: InboxFilter;
	onFilterChange: (filter: InboxFilter) => void;
	counts: Record<InboxFilter, number>;
	orientation?: "horizontal" | "vertical";
	className?: string;
}

const filterIcons: Record<InboxFilter, string> = {
	primary: "inbox",
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
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIdx = INBOX_FILTERS.findIndex((f) => f.id === activeFilter);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIdx;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	if (isVertical) {
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
				<p className="mb-2 px-2 font-medium text-label-xs text-mail-muted">
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
									? filter.id === "primary"
										? "text-blue-600 dark:text-blue-400"
										: "text-error-base dark:text-red-500"
									: "text-mail-muted hover:text-mail-foreground",
							)}
						>
							<span className="truncate">{filter.label}</span>
							<span
								className={cn(
									"shrink-0 text-label-xs tabular-nums",
									isActive ? "text-mail-muted" : "text-mail-muted",
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
					className="/20 bg-offset-light ring-1 ring-stroke-soft-100 dark:ring-stroke-soft-100/40"
				/>
			</nav>
		);
	}

	return (
		<TabMenuHorizontal.Root
			value={activeFilter}
			onValueChange={(val) => onFilterChange(val as InboxFilter)}
			className={className}
		>
			<TabMenuHorizontal.List
				className={cn(
					"relative h-10 gap-0 border-b! px-4 py-0",
					activeFilter === "primary"
						? "[&>div:last-child]:bg-blue-600 dark:[&>div:last-child]:bg-blue-500"
						: "[&>div:last-child]:bg-error-base dark:[&>div:last-child]:bg-red-500",
				)}
			>
				{INBOX_FILTERS.map((filter, index) => {
					const isActive = activeFilter === filter.id;
					const iconName = filterIcons[filter.id];
					const count = counts[filter.id];
					return (
						<TabMenuHorizontal.Trigger
							ref={(el) => {
								if (el) {
									buttonRefs.current[index] = el;
								}
							}}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-2.5 py-0! font-medium text-sm transition-colors",
								isActive
									? filter.id === "primary"
										? "text-blue-600! dark:text-blue-400!"
										: "text-error-base! dark:text-red-500!"
									: "text-mail-muted hover:text-mail-foreground",
							)}
							key={filter.id}
							value={filter.id}
							onClick={() => onFilterChange(filter.id)}
						>
							<Icon
								name={iconName}
								className={cn(
									"h-4 w-4 transition-colors",
									isActive
										? filter.id === "primary"
											? "text-blue-600 dark:text-blue-400"
											: "text-error-base dark:text-red-500"
										: "text-mail-muted",
								)}
							/>
							<span className="capitalize">
								{filter.label.replace("_", " ")}
							</span>
							{count > 0 && (
								<span
									className={cn(
										"shrink-0 rounded-full px-1.5 py-0.5 font-semibold text-[10px] transition-colors",
										isActive
											? filter.id === "primary"
												? "bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400"
												: "bg-error-base/10 text-error-base dark:bg-red-500/10 dark:text-red-500"
											: "/10 bg-offset-light text-mail-muted",
									)}
								>
									{count}
								</span>
							)}
						</TabMenuHorizontal.Trigger>
					);
				})}
				<AnimatePresence>
					{rect && activeIdx !== -1 ? (
						<motion.div
							className="absolute top-0 left-0 rounded-lg bg-neutral-alpha-10"
							initial={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 20,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									10,
								opacity: 0,
							}}
							animate={{
								pointerEvents: "none",
								width: rect.width,
								height: rect.height - 20,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									10,
								opacity: 1,
							}}
							exit={{
								pointerEvents: "none",
								opacity: 0,
								width: rect.width,
								height: rect.height - 20,
								left:
									rect.left -
									(tab?.offsetParent?.getBoundingClientRect().left || 0),
								top:
									rect.top -
									(tab?.offsetParent?.getBoundingClientRect().top || 0) +
									10,
							}}
							transition={{ duration: 0.14 }}
						/>
					) : null}
				</AnimatePresence>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	);
};
