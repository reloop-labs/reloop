import { cn } from "@reloop/ui/cn";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";

export type TemplatesTab = "explore" | "yours";

const items = [
	{ title: "Templates", value: "yours", shortcut: "1" },
	{ title: "Explore", value: "explore", shortcut: "2" },
] as const;

export function TemplatesTabs({
	value,
	onChange,
	yoursCount,
	end,
}: {
	value: TemplatesTab;
	onChange: (tab: TemplatesTab) => void;
	yoursCount?: number;
	/** Right-aligned in the tab row, e.g. Explore's search. */
	end?: ReactNode;
}) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	useHotkeys(
		"1",
		(e) => {
			e.preventDefault();
			onChange("yours");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useHotkeys(
		"2",
		(e) => {
			e.preventDefault();
			onChange("explore");
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	const activeIndex = items.findIndex((item) => item.value === value);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();
	const parentRect = tab?.offsetParent?.getBoundingClientRect();

	return (
		<div className="relative">
			<TabMenuHorizontal.Root value={value}>
				<TabMenuHorizontal.List className="relative h-11 gap-0 border-b! py-0">
					{items.map(({ value: itemValue, title, shortcut }, index) => (
						<TabMenuHorizontal.Trigger
							ref={(el) => {
								if (el) buttonRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredIdx(index)}
							onPointerLeave={() => setHoveredIdx(undefined)}
							className={cn(
								"flex cursor-pointer items-center gap-2 px-3 py-0! font-medium text-sm",
								hoveredIdx === undefined &&
									activeIndex === index &&
									"text-text-strong-950",
							)}
							key={itemValue}
							value={itemValue}
							onClick={() => onChange(itemValue)}
						>
							{title}
							{itemValue === "yours" && yoursCount ? (
								<span className="rounded-full bg-bg-weak-50 px-1.5 py-0.5 text-[11px] text-text-sub-600 leading-none ring-1 ring-stroke-soft-100 ring-inset dark:bg-bg-soft-200 dark:ring-stroke-soft-100/40">
									{yoursCount}
								</span>
							) : null}
							<ShortcutHint>{shortcut}</ShortcutHint>
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
									left: rect.left - (parentRect?.left || 0),
									top: rect.top - (parentRect?.top || 0) + 7,
									opacity: 0,
								}}
								animate={{
									pointerEvents: "none",
									width: rect.width,
									height: rect.height - 14,
									left: rect.left - (parentRect?.left || 0),
									top: rect.top - (parentRect?.top || 0) + 7,
									opacity: 1,
								}}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.14 }}
							/>
						) : null}
					</AnimatePresence>
				</TabMenuHorizontal.List>
			</TabMenuHorizontal.Root>
			{end ? (
				<div className="-translate-y-1/2 absolute top-1/2 right-0">{end}</div>
			) : null}
		</div>
	);
}
