import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import {
	getActiveMainNav,
	getAutoExpandedNav,
	SETTINGS_ADMIN_HOME,
	SETTINGS_MEMBER_HOME,
	visibleMainNavigation,
} from "../navigation";
import { SidebarNavIcon } from "./sidebar-nav-icon";
import { SidebarNavLink } from "./sidebar-nav-link";
import { SidebarSectionHeader } from "./sidebar-section-header";
import { useSidebarHoverBox } from "./use-sidebar-hover-box";

export function SidebarItems({
	isCollapsed = false,
	onOpenSettings,
}: {
	isCollapsed?: boolean;
	onOpenSettings?: () => void;
}) {
	const [hoveredEl, setHoveredEl] = useState<HTMLElement | undefined>(
		undefined,
	);
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
	const mainNavRefs = useRef<HTMLElement[]>([]);
	const subNavRefs = useRef<Record<string, HTMLAnchorElement[]>>({});
	const pathname = usePathname();
	const { canManageBilling } = useOrgPermissions();
	const settingsHref = canManageBilling
		? SETTINGS_ADMIN_HOME
		: SETTINGS_MEMBER_HOME;

	// Router basepath is /dashboard, so compare paths without it for active state.
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";

	const navigation = visibleMainNavigation;
	// Seed from the path so the active section paints open on mount instead of
	// animating open after the first effect (layout shift vs loading chrome).
	const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
		() => getAutoExpandedNav(pathWithoutSlug, navigation),
	);
	// User-closed sections stay closed until they leave that section or re-open it.
	// Without this, the active-path effect re-opens the dropdown after every close.
	const userCollapsedRef = useRef<Set<string>>(new Set());

	useEffect(() => {
		setExpandedItems((prev) => {
			let changed = false;
			const next = { ...prev };

			for (const item of navigation) {
				if (!item.items?.length) continue;

				const hasActiveSubItem = item.items.some((sub) =>
					pathWithoutSlug.startsWith(sub.path),
				);

				if (hasActiveSubItem) {
					// Auto-open only if the user hasn't explicitly collapsed it.
					if (!userCollapsedRef.current.has(item.path) && !next[item.path]) {
						next[item.path] = true;
						changed = true;
					}
				} else {
					// Left the section: clear the manual collapse so the next visit auto-opens.
					userCollapsedRef.current.delete(item.path);
				}
			}

			return changed ? next : prev;
		});
	}, [pathWithoutSlug]);

	const { activeMainIndex, activeSubInfo } = getActiveMainNav(
		pathWithoutSlug,
		navigation,
	);

	const activeEl = activeSubInfo
		? subNavRefs.current[activeSubInfo.mainPath]?.[activeSubInfo.subIndex]
		: mainNavRefs.current[activeMainIndex];
	const currentEl = hoveredEl ?? activeEl;
	// expandedItems shifts rows below without resizing them, so include in layout key.
	const expandedKey = Object.entries(expandedItems)
		.filter(([, open]) => open)
		.map(([path]) => path)
		.join(",");
	const hoverBox = useSidebarHoverBox(
		currentEl,
		containerEl,
		`${isCollapsed}:${expandedKey}`,
	);

	return (
		<div
			ref={setContainerEl}
			className={cn(
				"relative flex w-full flex-col",
				isCollapsed && "items-start",
			)}
			onPointerLeave={() => setHoveredEl(undefined)}
		>
			{navigation.map((item, index) => {
				const { path, label, iconName, isSpecial, items, section, shortcut } =
					item;
				if (path === "/ai") return null;
				const hasSubNav = items && items.length > 0;
				const isExpanded = expandedItems[path] && !isCollapsed;

				const prevItem = index > 0 ? navigation[index - 1] : null;
				const showSectionHeader =
					section && (!prevItem || prevItem.section !== section);

				return (
					<div
						key={path + index}
						className={cn(
							"flex flex-col",
							isCollapsed ? "items-start" : "w-full",
						)}
					>
						{showSectionHeader && (
							<SidebarSectionHeader
								label={section}
								isCollapsed={isCollapsed}
								isFirst={index === 0}
							/>
						)}
						<SidebarNavLink
							href={path === "/settings" ? settingsHref : path}
							ref={(el) => {
								if (el) mainNavRefs.current[index] = el;
							}}
							onPointerEnter={() => setHoveredEl(mainNavRefs.current[index])}
							onClick={
								path === "/settings" ? () => onOpenSettings?.() : undefined
							}
							className={cn(
								"relative z-10 flex h-8 items-center rounded-lg transition-all duration-150 ease-out",
								isCollapsed
									? "h-8 w-8 justify-start overflow-hidden px-2"
									: cn(
											"w-full gap-2.5 px-2.5",
											hasSubNav ? "justify-between" : "justify-start",
										),
							)}
							title={
								isCollapsed
									? shortcut
										? `${label} (${shortcut.label})`
										: label
									: undefined
							}
						>
							<span
								className={cn(
									"flex min-w-0 items-center",
									isCollapsed
										? "justify-center"
										: "flex-1 justify-between gap-2.5",
								)}
							>
								<span className="flex min-w-0 items-center gap-2.5">
									<SidebarNavIcon
										name={iconName}
										isSpecial={isSpecial}
										isActive={activeMainIndex === index}
									/>
									<span
										aria-hidden={isCollapsed || undefined}
										className={cn(
											"truncate font-medium text-[13px] transition-[color,opacity] duration-150 ease-out",
											isCollapsed && "opacity-0",
											isSpecial
												? "bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent"
												: activeMainIndex === index
													? "text-text-strong-950"
													: "text-text-sub-600 group-hover:text-text-strong-950",
										)}
									>
										{label}
									</span>
								</span>
								{!isCollapsed && shortcut && (
									<ShortcutHint>{shortcut.label}</ShortcutHint>
								)}
							</span>

							{hasSubNav && !isCollapsed && (
								<button
									type="button"
									tabIndex={0}
									aria-expanded={isExpanded}
									aria-label={
										isExpanded ? `Collapse ${label}` : `Expand ${label}`
									}
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										setExpandedItems((prev) => {
											const willOpen = !prev[path];
											if (willOpen) {
												userCollapsedRef.current.delete(path);
											} else {
												const isActiveSection = items?.some((sub) =>
													pathWithoutSlug.startsWith(sub.path),
												);
												if (isActiveSection) {
													userCollapsedRef.current.add(path);
												}
											}
											return { ...prev, [path]: willOpen };
										});
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
										<div className="my-0.5 ml-[17.5px] flex flex-col border-stroke-soft-200 border-l pb-0.5 pl-[9.5px]">
											{items.map((subItem, subIndex) => {
												const {
													label: subLabel,
													path: subPath,
													iconName: subIcon,
													shortcut: subShortcut,
												} = subItem;
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
															setHoveredEl(subNavRefs.current[path]?.[subIndex])
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
											})}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						)}
					</div>
				);
			})}

			<AnimatedHoverBackground
				box={hoverBox}
				className="!bg-neutral-alpha-10"
			/>
		</div>
	);
}
