"use client";
import * as TabMenuHorizontal from "@reloop/ui/components/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { useQueryState } from "nuqs";
import { useRef, useState } from "react";
import { cn } from "@/utils/cn";

const items = [
	{
		label: "Members",
		path: "members",
	},
	{
		label: "Invites",
		path: "invites",
	},
];

export const InviteTabs = () => {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const [tabValue, setTabValue] = useQueryState("tab", {
		defaultValue: "members",
	});

	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const activeIndex = items.findIndex((item) => item.path === tabValue);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect =
		hoveredIdx !== undefined ? tab?.getBoundingClientRect() : undefined;

	return (
		<TabMenuHorizontal.Root defaultValue="members" value={tabValue}>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! px-3 py-0">
				{items.map(({ label, path }, index) => (
					<TabMenuHorizontal.Trigger
						ref={(el) => {
							if (el) {
								buttonRefs.current[index] = el;
							}
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"cursor-pointer px-2.5 py-0! text-sm",
							!rect && currentIdx === index && "text-text-strong-950",
						)}
						key={path}
						value={path}
						onClick={() => setTabValue(path)}
					>
						{label}
					</TabMenuHorizontal.Trigger>
				))}
				<AnimatePresence>
					{rect ? (
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
