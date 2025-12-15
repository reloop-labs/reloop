"use client";

import { mainNavigation } from "@fe/dashboard/constants";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatedHoverBackground } from "./animated-hover-background";

interface MainNavigationProps {
	organizationSlug: string;
	isCollapsed?: boolean;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({
	organizationSlug,
	isCollapsed = false,
}) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLAnchorElement[]>([]);
	const pathname = usePathname();

	const pathWithoutSlug = pathname.replace(/^\/[^/]+/, "") || "/";
	const activeIndex = mainNavigation.findIndex((item) => {
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});

	const currentIdx = hoverIdx !== undefined ? hoverIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	return (
		<div className="relative">
			{mainNavigation.map(({ path, label, iconName }, index) => {
				const href = `/${organizationSlug}${path}`;

				return (
					<Link
						key={path + index}
						href={href}
						ref={(el) => {
							if (el) {
								buttonRefs.current[index] = el;
							}
						}}
						onPointerEnter={() => setHoverIdx(index)}
						onPointerLeave={() => setHoverIdx(undefined)}
						className={cn(
							"flex h-9 items-center gap-2 rounded-lg px-2 text-left transition-colors",
							isCollapsed ? "justify-center" : "justify-start",
							!currentRect && currentIdx === index && "bg-neutral-alpha-10",
							"hover:bg-neutral-alpha-5",
						)}
						title={isCollapsed ? label : undefined}
					>
						<Icon name={iconName} className="h-[17px] w-[17px] shrink-0" />
						<AnimatePresence mode="wait">
							{!isCollapsed && (
								<motion.span
									className="text-sm"
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.15 }}
								>
									{label}
								</motion.span>
							)}
						</AnimatePresence>
					</Link>
				);
			})}

			<AnimatedHoverBackground
				rect={currentRect}
				tabElement={currentTab}
			/>
		</div>
	);
};
