import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ShortcutHint } from "#/features/dashboard/keyboard-shortcuts-reveal";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { useOrgPermissions } from "#/features/settings/use-org-permissions";
import {
	filterSettingsNavigation,
	flattenSettingsItems,
	settingsNavigation,
} from "../navigation";
import {
	readSettingsNavPerms,
	writeSettingsNavPerms,
} from "./settings-nav-cache";
import { SidebarNavIcon } from "./sidebar-nav-icon";
import { SidebarNavButton, SidebarNavLink } from "./sidebar-nav-link";
import { SidebarSectionHeader } from "./sidebar-section-header";
import { useSidebarHoverBox } from "./use-sidebar-hover-box";

export function SettingsSidebarItems({
	isCollapsed = false,
	onCloseSettings,
}: {
	isCollapsed?: boolean;
	onCloseSettings?: () => void;
}) {
	const [hoveredEl, setHoveredEl] = useState<HTMLElement | undefined>(
		undefined,
	);
	const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);

	const backNavRef = useRef<HTMLButtonElement>(null);
	const itemRefs = useRef<HTMLAnchorElement[]>([]);
	// Manual open/close per parent; without one, a section is open while you're in it.
	const [expandOverrides, setExpandOverrides] = useState<
		Record<string, boolean>
	>({});

	const pathname = usePathname();
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";

	const { isSettled, isOrgAdmin, canManageTeam, canManageBilling } =
		useOrgPermissions();
	// Until role + billing resolve, reuse the last-known flags so admin rows
	// don't pop in (and shift everything below) after the sidebar paints.
	const [cachedPerms] = useState(readSettingsNavPerms);
	const perms =
		!isSettled && cachedPerms
			? cachedPerms
			: { isOrgAdmin, canManageTeam, canManageBilling };

	useEffect(() => {
		if (isSettled) {
			writeSettingsNavPerms({ isOrgAdmin, canManageTeam, canManageBilling });
		}
	}, [isSettled, isOrgAdmin, canManageTeam, canManageBilling]);

	// Members: hide Usage, Billing, Teams, Workspace (profile menu uses the same filter).
	const filteredSettingsNavigation = useMemo(
		() =>
			filterSettingsNavigation(settingsNavigation, {
				isOrgAdmin: perms.isOrgAdmin,
				canManageTeam: perms.canManageTeam,
				canManageBilling: perms.canManageBilling,
			}),
		[perms.isOrgAdmin, perms.canManageTeam, perms.canManageBilling],
	);
	const flatItems = useMemo(
		() =>
			filteredSettingsNavigation.flatMap((section) =>
				flattenSettingsItems(section.items),
			),
		[filteredSettingsNavigation],
	);

	const isPathActive = (path: string) =>
		path === "/settings"
			? pathWithoutSlug === "/settings"
			: pathWithoutSlug.startsWith(path);
	const hasActiveSub = (item: (typeof flatItems)[number]) =>
		"items" in item && !!item.items?.some((sub) => isPathActive(sub.path));
	// A parent is active on its own page only; its sub row takes over on sub pages.
	const isRowActive = (item: (typeof flatItems)[number]) =>
		isPathActive(item.path) && !hasActiveSub(item);

	// Leaving a section clears its manual collapse so the next visit auto-opens.
	useEffect(() => {
		setExpandOverrides((prev) => {
			const next = Object.fromEntries(
				Object.entries(prev).filter(
					([path, open]) => open || pathWithoutSlug.startsWith(path),
				),
			);
			return Object.keys(next).length === Object.keys(prev).length
				? prev
				: next;
		});
	}, [pathWithoutSlug]);

	const isSectionExpanded = (path: string) =>
		expandOverrides[path] ?? pathWithoutSlug.startsWith(path);

	const activeIndex = flatItems.findIndex((item) => isRowActive(item));

	const activeEl =
		activeIndex !== -1 ? itemRefs.current[activeIndex] : undefined;
	const currentEl = hoveredEl ?? activeEl;
	const expandedKey = flatItems
		.filter((item) => "items" in item && item.items?.length)
		.map((item) => `${item.path}:${isSectionExpanded(item.path)}`)
		.join(",");
	const hoverBox = useSidebarHoverBox(
		currentEl,
		containerEl,
		`${isCollapsed}:${pathWithoutSlug}:${expandedKey}`,
	);

	let globalIndex = 0;

	return (
		<div
			ref={setContainerEl}
			className={cn(
				"relative flex w-full flex-col",
				isCollapsed && "items-start",
			)}
			onPointerLeave={() => setHoveredEl(undefined)}
		>
			{/* Back to main sidebar, does not change the page */}
			<SidebarNavButton
				ref={backNavRef}
				onPointerEnter={() => setHoveredEl(backNavRef.current ?? undefined)}
				onClick={() => onCloseSettings?.()}
				className={cn(
					"relative z-10 mb-4 flex h-8 items-center rounded-lg transition-all duration-150 ease-out",
					isCollapsed
						? "h-8 w-8 justify-start overflow-hidden px-2"
						: "w-full justify-start gap-2.5 px-2.5",
				)}
				title={isCollapsed ? "Back to app" : undefined}
			>
				<span className="flex min-w-0 items-center gap-2.5">
					<Icon
						name="arrow-left"
						className="h-4 w-4 shrink-0 text-text-sub-600 opacity-70 transition-all duration-200 group-hover:-translate-x-0.5 group-hover:text-text-strong-950 group-hover:opacity-100"
					/>
					<span
						aria-hidden={isCollapsed || undefined}
						className={cn(
							"whitespace-nowrap font-medium text-[13px] text-text-sub-600 transition-[color,opacity] duration-150 ease-out group-hover:text-text-strong-950",
							isCollapsed && "opacity-0",
						)}
					>
						Back to app
					</span>
				</span>
			</SidebarNavButton>

			{filteredSettingsNavigation.map((section, sectionIdx) => (
				<div
					key={section.section}
					className={cn(
						"flex flex-col",
						isCollapsed ? "items-start" : "w-full",
					)}
				>
					<SidebarSectionHeader
						label={section.section}
						isCollapsed={isCollapsed}
						isFirst={sectionIdx === 0}
					/>

					{section.items.map((item) => {
						const currentIdx = globalIndex++;
						const subItems = item.items ?? [];
						const subStartIdx = globalIndex;
						globalIndex += subItems.length;
						const isItemActive = isRowActive(item);
						const hasSubNav = subItems.length > 0;
						const isExpanded =
							hasSubNav && !isCollapsed && isSectionExpanded(item.path);

						return (
							<div
								key={item.path}
								className={cn(
									"flex flex-col",
									isCollapsed ? "items-start" : "w-full",
								)}
							>
								<SidebarNavLink
									href={item.path}
									ref={(el) => {
										if (el) itemRefs.current[currentIdx] = el;
									}}
									onPointerEnter={() =>
										setHoveredEl(itemRefs.current[currentIdx])
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
											? item.shortcut
												? `${item.label} (${item.shortcut.label})`
												: item.label
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
												name={item.iconName}
												isActive={isItemActive || hasActiveSub(item)}
											/>
											<span
												aria-hidden={isCollapsed || undefined}
												className={cn(
													"truncate font-medium text-[13px] transition-[color,opacity] duration-150 ease-out",
													isCollapsed && "opacity-0",
													isItemActive || hasActiveSub(item)
														? "text-text-strong-950"
														: "text-text-sub-600 group-hover:text-text-strong-950",
												)}
											>
												{item.label}
											</span>
										</span>
										{!isCollapsed && item.shortcut && (
											<ShortcutHint>{item.shortcut.label}</ShortcutHint>
										)}
									</span>

									{hasSubNav && !isCollapsed && (
										<button
											type="button"
											aria-expanded={isExpanded}
											aria-label={
												isExpanded
													? `Collapse ${item.label}`
													: `Expand ${item.label}`
											}
											onClick={(e) => {
												e.preventDefault();
												e.stopPropagation();
												setExpandOverrides((prev) => ({
													...prev,
													[item.path]: !isExpanded,
												}));
											}}
											className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-bg-weak-50"
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
												key={`${item.path}-subnav`}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
												style={{ overflow: "hidden" }}
											>
												<div className="my-0.5 ml-[17.5px] flex flex-col border-stroke-soft-200 border-l pb-0.5 pl-[9.5px]">
													{subItems.map((sub, subOffset) => {
														const subIdx = subStartIdx + subOffset;
														const isSubActive = isPathActive(sub.path);
														return (
															<SidebarNavLink
																href={sub.path}
																key={sub.path}
																ref={(el) => {
																	if (el) itemRefs.current[subIdx] = el;
																}}
																onPointerEnter={() =>
																	setHoveredEl(itemRefs.current[subIdx])
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
																		name={sub.iconName}
																		isActive={isSubActive}
																		className="h-3.5 w-3.5"
																	/>
																	{sub.label}
																</span>
																{sub.shortcut && (
																	<ShortcutHint>
																		{sub.shortcut.label}
																	</ShortcutHint>
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
				</div>
			))}

			<AnimatedHoverBackground
				box={hoverBox}
				className="!bg-neutral-alpha-10"
			/>
		</div>
	);
}
