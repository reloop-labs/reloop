"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const items = [
	{
		title: "Editor",
		value: "visual",
		iconName: "pencil" as const,
	},
	{
		title: "Variables",
		value: "variables",
		iconName: "variable" as const,
	},
	{
		title: "History",
		value: "history",
		iconName: "history" as const,
	},
] as const;

interface TemplateInspectorTabsProps {
	viewMode: "visual" | "code" | "history" | "variables";
	onSelectTab: (tab: "visual" | "variables" | "history") => void;
}

export function TemplateInspectorTabs({
	viewMode,
	onSelectTab,
}: TemplateInspectorTabsProps) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const effectiveTabValue =
		viewMode === "variables"
			? "variables"
			: viewMode === "history"
				? "history"
				: "visual";

	const activeIndex = items.findIndex(
		(item) => item.value === effectiveTabValue,
	);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<div className="sticky top-0 z-20 shrink-0 bg-bg-white-0 dark:bg-black">
			<TabMenuHorizontal.Root value={effectiveTabValue}>
				<TabMenuHorizontal.List className="relative h-11 w-full gap-0 border-stroke-soft-200 border-b px-2 py-0 dark:border-stroke-soft-100/40">
					{items.map(({ value, title, iconName }, index) => (
						<TabMenuHorizontal.Trigger
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-1.5 px-3 py-0! font-medium text-text-sub-600 text-xs transition-colors",
								hoveredIdx === undefined &&
									activeIndex === index &&
									"text-text-strong-950",
							)}
							key={value}
							value={value}
							onClick={() => onSelectTab(value)}
						>
							<Icon name={iconName} className="h-3.5 w-3.5" />
							{title}
						</TabMenuHorizontal.Trigger>
					))}

					<AnimatePresence>
						{rect && activeIndex !== -1 ? (
							<motion.div
								className="absolute top-0 left-0 rounded-xl bg-neutral-alpha-10"
								initial={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										7,
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left:
										rect.left -
										(tab?.offsetParent?.getBoundingClientRect().left || 0),
									top:
										rect.top -
										(tab?.offsetParent?.getBoundingClientRect().top || 0) +
										7,
									opacity: 1,
								}}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</AnimatePresence>
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>
		</div>
	);
}
