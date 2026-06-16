"use client";

import type { IntegrationMode } from "@fe/dashboard/lib/integration/types";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const modes = [
	{
		id: "ai" as IntegrationMode,
		label: "Prompt AI",
		icon: "sparkling",
	},
	{
		id: "manual" as IntegrationMode,
		label: "Direct SDK",
		icon: "code",
	},
] as const;

export function IntegrationModeTabs({
	value,
	onChange,
	className,
}: {
	value: IntegrationMode;
	onChange: (mode: IntegrationMode) => void;
	className?: string;
}) {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIndex = modes.findIndex((mode) => mode.id === value);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<TabMenuHorizontal.Root value={value} className={className}>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! py-0">
				{modes.map((mode, index) => (
					<TabMenuHorizontal.Trigger
						ref={(el) => {
							if (el) {
								buttonRefs.current[index] = el;
							}
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-4 py-0! font-medium text-sm",
							hoveredIdx === undefined &&
								activeIndex === index &&
								"text-text-strong-950",
						)}
						key={mode.id}
						value={mode.id}
						onClick={() => onChange(mode.id)}
					>
						<Icon name={mode.icon} className="h-4 w-4" />
						{mode.label}
					</TabMenuHorizontal.Trigger>
				))}
				<AnimatePresence>
					{rect && activeIndex !== -1 ? (
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
							transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
						/>
					) : null}
				</AnimatePresence>
			</TabMenuHorizontal.List>
		</TabMenuHorizontal.Root>
	);
}
