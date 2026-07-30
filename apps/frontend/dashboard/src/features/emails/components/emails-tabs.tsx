import { useRouter, usePathname } from "next/navigation";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const items = [
	{
		title: "Sent",
		value: "sent",
		iconName: "mail-send" as const,
		path: "/",
	},
	{
		title: "Received",
		value: "received",
		iconName: "mail-receive" as const,
		path: "/receive",
	},
] as const;

export function EmailsTabs() {
	const router = useRouter();
	const pathname = usePathname();
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);

	const isReceivedPage =
		pathname === "/receive" || pathname.startsWith("/receive/");
	const effectiveTabValue = isReceivedPage ? "received" : "sent";

	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const activeIndex = items.findIndex(
		(item) => item.value === effectiveTabValue,
	);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect = tab?.getBoundingClientRect();

	return (
		<TabMenuHorizontal.Root value={effectiveTabValue}>
			<TabMenuHorizontal.List className="relative h-11 gap-0 border-b! py-0">
				{items.map(({ value, title, iconName, path }, index) => (
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
						key={value}
						value={value}
						onClick={() => router.push(path)}
					>
						<Icon name={iconName} className="h-4 w-4" />
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
	);
}
