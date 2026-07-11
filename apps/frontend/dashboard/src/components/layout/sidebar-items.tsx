"use client";

import { mainNavigation } from "@fe/dashboard/constants";
import { useOrgPermissions } from "@fe/dashboard/hooks/use-org-permissions";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatedHoverBackground } from "../animated-hover-background";

interface SidebarItemsProps {
	isCollapsed?: boolean;
}

export const SidebarItems: React.FC<SidebarItemsProps> = ({
	isCollapsed = false,
}) => {
	// Single unified hover element — drives the one shared animated background
	const [hoveredEl, setHoveredEl] = useState<HTMLAnchorElement | undefined>(
		undefined,
	);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);

	const mainNavRefs = useRef<HTMLAnchorElement[]>([]);
	const subNavRefs = useRef<Record<string, HTMLAnchorElement[]>>({});

	const pathname = usePathname();
	const pathWithoutSlug = pathname;
	const { canManageTeam, canManageBilling } = useOrgPermissions();

	const navigation = useMemo(
		() =>
			mainNavigation
				.filter((item) => {
					if (item.path === "/credits") return canManageBilling;
					return true;
				})
				.map((item) => {
					if (item.path !== "/settings" || !item.items) return item;
					return {
						...item,
						items: item.items.filter((sub) => {
							if (sub.path === "/settings/members") return canManageTeam;
							return true;
						}),
					};
				}),
		[canManageTeam, canManageBilling],
	);

	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
		{},
	);

	useEffect(() => {
		navigation.forEach((item) => {
			const hasActiveSubItem = item.items?.some((sub) =>
				pathWithoutSlug.startsWith(sub.path),
			);
			if (hasActiveSubItem) {
				setExpandedItems((prev) => ({ ...prev, [item.path]: true }));
			}
		});
	}, [pathWithoutSlug, navigation]);

	const activeMainIndex = navigation.findIndex((item) => {
		if (item.items?.some((sub) => pathWithoutSlug.startsWith(sub.path))) {
			return false;
		}
		if (item.path === "/") return pathWithoutSlug === "/";
		return pathWithoutSlug.startsWith(item.path);
	});

	const activeSubInfo = navigation
		.map((item, _mainIndex) => {
			const subIndex = item.items?.findIndex((sub) =>
				sub.path === "/settings"
					? pathWithoutSlug === "/settings"
					: pathWithoutSlug.startsWith(sub.path),
			);
			if (subIndex !== undefined && subIndex !== -1) {
				return { mainPath: item.path, subIndex };
			}
			return null;
		})
		.find((info) => info !== null);

	// The single "current" element: hovered takes priority, otherwise the active one
	const activeEl = activeSubInfo
		? subNavRefs.current[activeSubInfo.mainPath]?.[activeSubInfo.subIndex]
		: mainNavRefs.current[activeMainIndex];
	const currentEl = hoveredEl ?? activeEl;

	// Single useLayoutEffect that feeds rect for the ONE shared animated background
	useLayoutEffect(() => {
		if (currentEl) {
			setRect(currentEl.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [currentEl]);

	return (
		<div
			className={cn("relative flex flex-col", isCollapsed && "items-center")}
		>
			{navigation.map(({ path, label, iconName, isSpecial, items }, index) => {
				if (path === "/ai") return null;
				const hasSubNav = items && items.length > 0;
				const isExpanded = expandedItems[path] && !isCollapsed;

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
								"group relative z-10 flex h-8 items-center rounded-lg transition-all",
								isCollapsed
									? "h-8 w-8 justify-center px-0"
									: cn(
											"w-full gap-2.5 px-2.5",
											hasSubNav ? "justify-between" : "justify-start",
										),
							)}
							title={isCollapsed ? label : undefined}
						>
							<span
								className={cn(
									"flex min-w-0 items-center",
									isCollapsed ? "" : "gap-2.5",
								)}
							>
								<Icon
									name={iconName}
									className={cn(
										"h-4 w-4 shrink-0 transition-all duration-200",
										isSpecial
											? ""
											: activeMainIndex === index
												? "text-primary-base"
												: "text-text-sub-600 opacity-70 group-hover:text-primary-base group-hover:opacity-100",
									)}
								/>
								{!isCollapsed && (
									<span
										className={cn(
											"font-medium text-[13px] transition-colors",
											isSpecial
												? "bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent"
												: activeMainIndex === index
													? "text-primary-base"
													: "text-text-sub-600 group-hover:text-primary-base",
										)}
									>
										{label}
									</span>
								)}
							</span>

							{hasSubNav && !isCollapsed && (
								<button
									type="button"
									tabIndex={0}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setExpandedItems((prev) => ({
											...prev,
											[path]: !prev[path],
										}));
									}}
									className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-bg-weak-50"
								>
									<Icon
										name="chevron-right"
										className={cn(
											"h-3 w-3 shrink-0 text-text-sub-600 opacity-60 transition-transform duration-200",
											isExpanded && "rotate-90",
										)}
									/>
								</button>
							)}
						</Link>

						{hasSubNav && !isCollapsed && (
							<AnimatePresence initial={false}>
								{isExpanded && (
									<motion.div
										key={`${path}-subnav`}
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
										style={{ overflow: "hidden" }}
									>
										<div className="my-0.5 ml-[14px] flex flex-col border-stroke-soft-200 border-l pb-0.5 pl-2">
											{items.map(
												(
													{ label: subLabel, path: subPath, iconName: subIcon },
													subIndex,
												) => {
													const isSubActive = subPath === "/settings"
														? pathWithoutSlug === "/settings"
														: pathWithoutSlug.startsWith(subPath);
													return (
														<Link
															key={subPath}
															href={subPath}
															ref={(el) => {
																if (el) {
																	if (!subNavRefs.current[path]) {
																		subNavRefs.current[path] = [];
																	}
																	subNavRefs.current[path][subIndex] = el;
																}
															}}
															onPointerEnter={() =>
																setHoveredEl(
																	subNavRefs.current[path]?.[subIndex],
																)
															}
															onPointerLeave={() => setHoveredEl(undefined)}
															className={cn(
																"group relative z-10 flex h-7 items-center gap-1.5 rounded-md px-2 font-medium text-[12px] transition-colors",
																isSubActive
																	? "text-primary-base"
																	: "text-text-sub-600 hover:text-primary-base",
															)}
														>
															<Icon
																name={subIcon}
																className={cn(
																	"h-3.5 w-3.5 shrink-0 transition-colors",
																	isSubActive
																		? "text-primary-base"
																		: "opacity-70 group-hover:text-primary-base group-hover:opacity-100",
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
			<AnimatedHoverBackground
				rect={rect}
				tabElement={currentEl}
				className="!bg-primary-alpha-10"
			/>
		</div>
	);
};
