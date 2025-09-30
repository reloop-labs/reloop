"use client";
import { mainNavigation } from "@dashboard/constants";
import { useUserOrganization } from "@dashboard/providers/org-provider";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as TabMenuHorizontal from "@reloop/ui/tab-menu-horizontal";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

export const SubNavbar = () => {
	const [hoveredIdx, setHoveredIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);
	const pathname = usePathname();
	const { push } = useUserOrganization();

	const getTabValue = (pathname: string) => {
		const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";

		const matchingItem = mainNavigation.find((item) => {
			if (item.path === "/") return pathWithoutSlug === "/";
			return pathWithoutSlug.startsWith(item.path);
		});
		return matchingItem?.path || "/";
	};

	const activeIndex = mainNavigation.findIndex(
		(item) => item.path === getTabValue(pathname),
	);
	const currentIdx = hoveredIdx !== undefined ? hoveredIdx : activeIndex;
	const tab = buttonRefs.current[currentIdx];
	const rect =
		hoveredIdx !== undefined ? tab?.getBoundingClientRect() : undefined;

	return (
		<TabMenuHorizontal.Root defaultValue={"/"} value={getTabValue(pathname)}>
			<TabMenuHorizontal.List className="relative h-10 gap-0 border-b! px-3 py-0">
				{mainNavigation.map(({ label, path, iconName }, index) => (
					<TabMenuHorizontal.Trigger
						ref={(el) => {
							if (el) {
								buttonRefs.current[index] = el;
							}
						}}
						onPointerEnter={() => setHoveredIdx(index)}
						onPointerLeave={() => setHoveredIdx(undefined)}
						className={cn(
							"flex cursor-pointer items-center gap-2 px-2.5 py-0! text-sm",
							!rect && currentIdx === index && "text-text-strong-950",
						)}
						key={path}
						value={path}
						onClick={() => push(path)}
					>
						<Icon name={iconName} className="h-4 w-4" />
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
