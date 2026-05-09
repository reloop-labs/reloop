"use client";

import { mainNavigation } from "@fe/dashboard/constants";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface SidebarItemsProps {
	isCollapsed?: boolean;
}

const contactsSubNav = [
	{ label: "Properties", path: "/contacts/properties", iconName: "tag" },
	{ label: "Groups", path: "/contacts/groups", iconName: "modules" },
	{
		label: "Channels",
		path: "/contacts/channels",
		iconName: "notification-indicator",
	},
] as const;

const settingsSubNav = [
	{ label: "Members", path: "/settings/members", iconName: "users" },
	{ label: "SMTP", path: "/settings/smtp", iconName: "mail-single" },
	{
		label: "Integrations",
		path: "/settings/integrations",
		iconName: "webhook",
	},
	{ label: "Billing", path: "/settings/billing", iconName: "invoice" },
	{ label: "Usage", path: "/settings/usage", iconName: "barchart" },
] as const;

export const SidebarItems: React.FC<SidebarItemsProps> = ({
	isCollapsed = false,
}) => {
	// Single unified hover element — drives the one shared animated background
	const [hoveredEl, setHoveredEl] = useState<HTMLAnchorElement | undefined>(
		undefined,
	);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);

	const mainNavRefs = useRef<HTMLAnchorElement[]>([]);
	const contactsSubNavRefs = useRef<HTMLAnchorElement[]>([]);
	const settingsSubNavRefs = useRef<HTMLAnchorElement[]>([]);

	const pathname = usePathname();
	const pathWithoutSlug = pathname;

	const isOnContactsSubPage = contactsSubNav.some((item) =>
		pathWithoutSlug.startsWith(item.path),
	);
	const isOnContacts = pathWithoutSlug.startsWith("/contacts");

	const isOnSettingsSubPage = settingsSubNav.some((item) =>
		pathWithoutSlug.startsWith(item.path),
	);
	const isOnSettings = pathWithoutSlug.startsWith("/settings");

	const [isContactsExpanded, setIsContactsExpanded] = useState(isOnContacts);
	const [isSettingsExpanded, setIsSettingsExpanded] = useState(isOnSettings);

	useEffect(() => {
		if (isOnContacts) {
			setIsContactsExpanded(true);
		}
	}, [isOnContacts]);

	useEffect(() => {
		if (isOnSettings) {
			setIsSettingsExpanded(true);
		}
	}, [isOnSettings]);

	const activeIndex =
		isOnContactsSubPage || isOnSettingsSubPage
			? -1
			: mainNavigation.findIndex((item) => {
					if (item.path === "/") return pathWithoutSlug === "/";
					return pathWithoutSlug.startsWith(item.path);
				});

	const subActiveIndex = isOnContactsSubPage
		? contactsSubNav.findIndex((item) => pathWithoutSlug.startsWith(item.path))
		: isOnSettingsSubPage
			? settingsSubNav.findIndex((item) =>
					pathWithoutSlug.startsWith(item.path),
				)
			: -1;

	// The single "current" element: hovered takes priority, otherwise the active one
	const activeEl = isOnContactsSubPage
		? contactsSubNavRefs.current[subActiveIndex]
		: isOnSettingsSubPage
			? settingsSubNavRefs.current[subActiveIndex]
			: mainNavRefs.current[activeIndex];
	const currentEl = hoveredEl ?? activeEl;

	// Single useLayoutEffect that feeds rect for the ONE shared animated background
	useLayoutEffect(() => {
		if (currentEl) {
			setRect(currentEl.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [
		currentEl,
		isCollapsed,
		pathname,
		isContactsExpanded,
		isSettingsExpanded,
	]);

	return (
		// Single relative container — the animated pill lives here and nowhere else
		<div className="relative">
			{mainNavigation.map(({ path, label, iconName, isSpecial }, index) => {
				const isContactsItem = path === "/contacts";
				const isSettingsItem = path === "/settings";

				return (
					<div key={path + index}>
						<Link
							href={path}
							ref={(el) => {
								if (el) mainNavRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredEl(mainNavRefs.current[index])}
							onPointerLeave={() => setHoveredEl(undefined)}
							className={cn(
								"relative z-10 flex h-8 items-center gap-2 rounded-lg px-2 text-left",
								(isContactsItem || isSettingsItem) && !isCollapsed
									? "justify-between"
									: isCollapsed
										? "justify-center"
										: "justify-start",
							)}
							title={isCollapsed ? label : undefined}
						>
							<span className="flex min-w-0 items-center gap-2">
								<Icon
									name={iconName}
									className={cn(
										"h-3.5 w-3.5 shrink-0",
										!isSpecial && activeIndex !== index
											? "text-text-sub-600 opacity-70"
											: "",
									)}
								/>
								{!isCollapsed && (
									<span
										className={cn(
											"font-medium text-sm transition-colors",
											isSpecial
												? "bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent"
												: activeIndex !== index
													? "text-text-sub-600"
													: "text-foreground",
										)}
									>
										{label}
									</span>
								)}
							</span>

							{(isContactsItem || isSettingsItem) && !isCollapsed && (
								<button
									type="button"
									tabIndex={0}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										if (isContactsItem) {
											setIsContactsExpanded((prev) => !prev);
										} else {
											setIsSettingsExpanded((prev) => !prev);
										}
									}}
									className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-neutral-alpha-10"
								>
									<Icon
										name="chevron-right"
										className={cn(
											"h-3 w-3 shrink-0 text-text-sub-600 opacity-60 transition-transform duration-200",
											((isContactsItem && isContactsExpanded) ||
												(isSettingsItem && isSettingsExpanded)) &&
												"rotate-90",
										)}
									/>
								</button>
							)}
						</Link>

						{isContactsItem && !isCollapsed && (
							<AnimatePresence initial={false}>
								{isContactsExpanded && (
									<motion.div
										key="contacts-subnav"
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
										style={{ overflow: "hidden" }}
									>
										<div className="my-0.5 ml-[14px] flex flex-col border-neutral-alpha-10 border-l pb-0.5 pl-2">
											{contactsSubNav.map(
												(
													{ label: subLabel, path: subPath, iconName: subIcon },
													subIndex,
												) => {
													const isSubActive =
														pathWithoutSlug.startsWith(subPath);
													return (
														<Link
															key={subPath}
															href={subPath}
															ref={(el) => {
																if (el)
																	contactsSubNavRefs.current[subIndex] = el;
															}}
															onPointerEnter={() =>
																setHoveredEl(
																	contactsSubNavRefs.current[subIndex],
																)
															}
															onPointerLeave={() => setHoveredEl(undefined)}
															className={cn(
																"relative z-10 flex h-7 items-center gap-1.5 rounded-md px-2 font-medium text-[13px]",
																isSubActive
																	? "text-foreground"
																	: "text-text-sub-600",
															)}
														>
															<Icon
																name={subIcon}
																className={cn(
																	"h-3.5 w-3.5 shrink-0",
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

						{isSettingsItem && !isCollapsed && (
							<AnimatePresence initial={false}>
								{isSettingsExpanded && (
									<motion.div
										key="settings-subnav"
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
										style={{ overflow: "hidden" }}
									>
										<div className="my-0.5 ml-[14px] flex flex-col border-neutral-alpha-10 border-l pb-0.5 pl-2">
											{settingsSubNav.map(
												(
													{ label: subLabel, path: subPath, iconName: subIcon },
													subIndex,
												) => {
													const isSubActive =
														pathWithoutSlug.startsWith(subPath);
													return (
														<Link
															key={subPath}
															href={subPath}
															ref={(el) => {
																if (el)
																	settingsSubNavRefs.current[subIndex] = el;
															}}
															onPointerEnter={() =>
																setHoveredEl(
																	settingsSubNavRefs.current[subIndex],
																)
															}
															onPointerLeave={() => setHoveredEl(undefined)}
															className={cn(
																"relative z-10 flex h-7 items-center gap-1.5 rounded-md px-2 font-medium text-[13px]",
																isSubActive
																	? "text-foreground"
																	: "text-text-sub-600",
															)}
														>
															<Icon
																name={subIcon}
																className={cn(
																	"h-3.5 w-3.5 shrink-0",
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

			{/* The ONE shared animated hover/active background for everything */}
			<AnimatedHoverBackground rect={rect} tabElement={currentEl} />
		</div>
	);
};
