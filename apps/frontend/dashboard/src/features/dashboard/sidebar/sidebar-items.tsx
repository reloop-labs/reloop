import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import {
	mainNavigation,
	SETTINGS_ADMIN_HOME,
	SETTINGS_MEMBER_HOME,
} from "../navigation";
import { SidebarNavIcon } from "./sidebar-nav-icon";
import { SidebarNavLink } from "./sidebar-nav-link";

/** Sidebar width transition is 200ms — remeasure after it settles. */
const COLLAPSE_SETTLE_MS = 220;

export function SidebarItems({
	isCollapsed = false,
}: {
	isCollapsed?: boolean;
}) {
	const [hoveredEl, setHoveredEl] = useState<HTMLAnchorElement | undefined>(
		undefined,
	);
	const [rect, setRect] = useState<DOMRect | undefined>(undefined);
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const mainNavRefs = useRef<HTMLAnchorElement[]>([]);
	const subNavRefs = useRef<Record<string, HTMLAnchorElement[]>>({});
	const pathname = usePathname();
	const { isOrgAdmin } = useOrgPermissions();

	// Router basepath is /dashboard — compare paths without it for active state.
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";

	// Members land on profile; admins land on usage (settings home).
	const navigation = useMemo(
		() =>
			mainNavigation.map((item) =>
				item.path === "/settings"
					? {
							...item,
							path: isOrgAdmin ? SETTINGS_ADMIN_HOME : SETTINGS_MEMBER_HOME,
						}
					: item,
			),
		[isOrgAdmin],
	);
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
		{},
	);

	useEffect(() => {
		for (const item of navigation) {
			const hasActiveSubItem = item.items?.some((sub) =>
				pathWithoutSlug.startsWith(sub.path),
			);
			if (hasActiveSubItem) {
				setExpandedItems((prev) => ({ ...prev, [item.path]: true }));
			}
		}
	}, [pathWithoutSlug, navigation]);

	const activeMainIndex = navigation.findIndex((item) => {
		if (item.items?.some((sub) => pathWithoutSlug.startsWith(sub.path))) {
			return false;
		}
		// Settings href is role-aware (/settings vs /settings/profile) but should
		// highlight for any settings route.
		if (item.path.startsWith("/settings")) {
			return pathWithoutSlug.startsWith("/settings");
		}
		// Emails is dashboard home + receive + email detail.
		if (item.path === "/") {
			return (
				pathWithoutSlug === "/" ||
				pathWithoutSlug.startsWith("/receive") ||
				pathWithoutSlug.startsWith("/emails")
			);
		}
		// Inbox list only — /inbox/$mailboxId is the full-screen mailbox UI.
		if (item.path === "/inbox") {
			return pathWithoutSlug === "/inbox";
		}
		return pathWithoutSlug.startsWith(item.path);
	});

	const activeSubInfo = navigation
		.map((item) => {
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

	const activeEl = activeSubInfo
		? subNavRefs.current[activeSubInfo.mainPath]?.[activeSubInfo.subIndex]
		: mainNavRefs.current[activeMainIndex];
	const currentEl = hoveredEl ?? activeEl;

	// Remeasure on active/hover change AND when collapse layout changes —
	// otherwise the highlight keeps the expanded width/position.
	useLayoutEffect(() => {
		if (currentEl) {
			setRect(currentEl.getBoundingClientRect());
		} else {
			setRect(undefined);
		}
	}, [currentEl, isCollapsed, containerEl]);

	// Sidebar width animates over 200ms; catch the settled layout too.
	useLayoutEffect(() => {
		if (!currentEl) return;
		const id = window.setTimeout(() => {
			setRect(currentEl.getBoundingClientRect());
		}, COLLAPSE_SETTLE_MS);
		return () => window.clearTimeout(id);
	}, [isCollapsed, currentEl]);

	return (
		<div
			ref={setContainerEl}
			className={cn("relative flex flex-col", isCollapsed && "items-center")}
			onPointerLeave={() => setHoveredEl(undefined)}
		>
			{navigation.map((item, index) => {
				const { path, label, iconName, isSpecial, items, section, shortcut } = item;
				if (path === "/ai") return null;
				const hasSubNav = items && items.length > 0;
				const isExpanded = expandedItems[path] && !isCollapsed;

				const prevItem = index > 0 ? navigation[index - 1] : null;
				const showSectionHeader =
					section && (!prevItem || prevItem.section !== section);

				return (
					<div
						key={path + index}
						className={cn("flex flex-col", isCollapsed && "items-center")}
					>
						{showSectionHeader &&
							(isCollapsed ? (
								index > 0 && (
									<div className="my-2 h-[1px] w-6 self-center bg-stroke-soft-200" />
								)
							) : (
								<div
									className={cn(
										"px-2.5 pt-4 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
										index === 0 && "pt-1.5",
									)}
								>
									{section}
								</div>
							))}
						<SidebarNavLink
							href={path}
							ref={(el) => {
								if (el) mainNavRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredEl(mainNavRefs.current[index])}
							className={cn(
								"relative z-10 flex h-8 items-center rounded-lg transition-all",
								isCollapsed
									? "h-8 w-8 justify-center px-0"
									: cn(
											"w-full gap-2.5 px-2.5",
											hasSubNav ? "justify-between" : "justify-start",
										),
							)}
							title={isCollapsed ? (shortcut ? `${label} (${shortcut.label})` : label) : undefined}
						>
							<span
								className={cn(
									"flex min-w-0 items-center",
									isCollapsed
										? "justify-center"
										: "flex-1 justify-between gap-2.5",
								)}
							>
								<span
									className={cn(
										"flex min-w-0 items-center",
										!isCollapsed && "gap-2.5",
									)}
								>
									<SidebarNavIcon
										name={iconName}
										isSpecial={isSpecial}
										isActive={activeMainIndex === index}
									/>
									{!isCollapsed && (
										<span
											className={cn(
												"truncate font-medium text-[13px] transition-colors",
												isSpecial
													? "bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent"
													: activeMainIndex === index
														? "text-text-strong-950"
														: "text-text-sub-600 group-hover:text-text-strong-950",
											)}
										>
											{label}
										</span>
									)}
								</span>
								{!isCollapsed && shortcut && (
									<ShortcutHint>{shortcut.label}</ShortcutHint>
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
						</SidebarNavLink>

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
													subItem,
													subIndex,
												) => {
													const { label: subLabel, path: subPath, iconName: subIcon, shortcut: subShortcut } = subItem;
													const isSubActive =
														subPath === "/settings"
															? pathWithoutSlug === "/settings"
															: pathWithoutSlug.startsWith(subPath);
													return (
														<SidebarNavLink
															href={subPath}
															key={subPath}
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
															className={cn(
																"relative z-10 flex h-7 items-center justify-between gap-1.5 rounded-md px-2 font-medium text-[12px] transition-colors",
																isSubActive
																	? "text-text-strong-950"
																	: "text-text-sub-600 hover:text-text-strong-950",
															)}
														>
															<span className="flex min-w-0 items-center gap-1.5">
																<SidebarNavIcon
																	name={subIcon}
																	isActive={isSubActive}
																	className="h-3.5 w-3.5"
																/>
																{subLabel}
															</span>
															{subShortcut && (
																<ShortcutHint>{subShortcut.label}</ShortcutHint>
															)}
														</SidebarNavLink>
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

			<AnimatedHoverBackground
				rect={rect}
				tabElement={currentEl}
				containerElement={containerEl}
				className="!bg-neutral-alpha-10"
			/>
		</div>
	);
}
