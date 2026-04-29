"use client";

import { mainNavigation } from "@fe/dashboard/constants";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface SidebarItemsProps {
	isCollapsed?: boolean;
}

const contactsSubNav = [
	{ label: "Properties", path: "/contacts/properties", iconName: "tag" },
	{ label: "Groups", path: "/contacts/groups", iconName: "modules" },
	{
		label: "Topics",
		path: "/contacts/topics",
		iconName: "notification-indicator",
	},
] as const;

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

	const isOnContacts = pathname.startsWith("/contacts");

	return (
		<div className="relative">
			{mainNavigation.map(({ path, label, iconName }, index) => {
				const href = path;
				const isContactsItem = path === "/contacts";

				return (
					<div key={path + index}>
						<Link
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
								isContactsItem && !isCollapsed
									? "justify-between"
									: isCollapsed
										? "justify-center"
										: "justify-start",
								!rect && currentIdx === index && "bg-neutral-alpha-10",
								"hover:bg-neutral-alpha-5",
							)}
							title={isCollapsed ? label : undefined}
						>
							{/* Left side: icon + label */}
							<span className="flex min-w-0 items-center gap-2">
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
							</span>

							{/* Chevron for contacts item */}
							{isContactsItem && !isCollapsed && (
								<Icon
									name="chevron-right"
									className={cn(
										"h-3 w-3 shrink-0 text-text-sub-600 opacity-60 transition-transform duration-200",
										isOnContacts && "rotate-90",
									)}
								/>
							)}
						</Link>

						{/* Contacts sub-navigation — smooth Framer Motion height animation */}
						{isContactsItem && !isCollapsed && (
							<AnimatePresence initial={false}>
								{isOnContacts && (
									<motion.div
										key="contacts-subnav"
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
										style={{ overflow: "hidden" }}
									>
										<div className="my-0.5 ml-[18px] flex flex-col gap-0.5 border-neutral-alpha-10 border-l pb-0.5 pl-2">
											{contactsSubNav.map(
												({
													label: subLabel,
													path: subPath,
													iconName: subIcon,
												}) => {
													const isSubActive = pathname.startsWith(subPath);
													return (
														<Link
															key={subPath}
															href={subPath}
															className={cn(
																"flex h-7 items-center gap-1.5 rounded-md px-2 text-xs transition-colors",
																isSubActive
																	? "bg-neutral-alpha-10 font-medium text-foreground"
																	: "text-text-sub-600 hover:bg-neutral-alpha-5 hover:text-foreground",
															)}
														>
															<Icon
																name={subIcon}
																className={cn(
																	"h-3 w-3 shrink-0",
																	!isSubActive && "opacity-70",
																)}
															/>
															{subLabel}
														</Link>
													);
												},
											)}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						)}
					</div>
				);
			})}

			<AnimatedHoverBackground rect={rect} tabElement={currentTab} />
		</div>
	);
};
