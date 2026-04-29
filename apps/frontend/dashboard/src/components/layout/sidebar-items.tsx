"use client";

import { mainNavigation } from "@fe/dashboard/constants";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface SidebarItemsProps {
	isCollapsed?: boolean;
}

export const SidebarItems: React.FC<SidebarItemsProps> = ({
	isCollapsed = false,
}) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);
	const buttonRefs = useRef<HTMLAnchorElement[]>([]);
	const pathname = usePathname();

	const pathWithoutSlug = pathname;
	const activeIndex = mainNavigation.findIndex((item) => {
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});

	const currentIdx = hoverIdx !== undefined ? hoverIdx : activeIndex;
	const currentTab = buttonRefs.current[currentIdx];

	useLayoutEffect(() => {
		if (currentTab) {
			setRect(currentTab.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [currentTab, isCollapsed]);

	return (
		<div className="relative">
			{mainNavigation.map(({ path, label, iconName }, index) => {
				const href = path;

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
							"flex h-8 items-center gap-2 rounded-lg px-2 text-left transition-colors",
							isCollapsed ? "justify-center" : "justify-start",
							!rect && currentIdx === index && "bg-neutral-alpha-10",
							"hover:bg-neutral-alpha-5",
						)}
						title={isCollapsed ? label : undefined}
					>
						<Icon
							name={iconName}
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								activeIndex !== index ? "text-text-sub-600 opacity-90" : "",
							)}
						/>
						{!isCollapsed && (
							<span
								className={cn(
									"font-medium text-sm",
									activeIndex !== index && "text-text-sub-600",
								)}
							>
								{label}
							</span>
						)}
					</Link>
				);
			})}

			<AnimatedHoverBackground rect={rect} tabElement={currentTab} />
		</div>
	);
};
