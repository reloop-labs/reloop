"use client";

import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { Logo } from "@reloop/ui/logo";
import { usePathname } from "next/navigation";
import { DashboardContentSkeleton } from "./dashboard-content-skeleton";
import {
	getActiveMainNav,
	getAutoExpandedNav,
	type SettingsNavigationItem,
	settingsNavigation,
	visibleMainNavigation,
} from "./navigation";
import { PageHeaderSkeleton } from "./page-header/page-header";
import { ThemeToggle } from "./page-header/theme-toggle";
import { CollapsedThemeToggle } from "./sidebar/main-sidebar";
import { SidebarNavIcon } from "./sidebar/sidebar-nav-icon";

/** Show only in the expanded / collapsed rail (driven by `<html data-sidebar-collapsed>`). */
const EXPANDED_ONLY = "sidebar-collapsed:hidden";
const COLLAPSED_ONLY = "hidden sidebar-collapsed:flex";

/**
 * Mirrors `SidebarItems` row-for-row (same heights, active row, auto-expanded
 * section) so swapping in the live nav doesn't shift anything.
 */
function LoadingSidebarNav() {
	const pathname = usePathname() ?? "/";
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	const navigation = visibleMainNavigation;
	const { activeMainIndex, activeSubInfo } = getActiveMainNav(
		pathWithoutSlug,
		navigation,
	);
	const expanded = getAutoExpandedNav(pathWithoutSlug, navigation);

	return (
		<div className="relative flex w-full flex-col sidebar-collapsed:items-center">
			{navigation.map((item, index) => {
				if (item.path === "/ai") return null;
				const prevItem = index > 0 ? navigation[index - 1] : null;
				const showSectionHeader =
					item.section && (!prevItem || prevItem.section !== item.section);
				const hasSubNav = Boolean(item.items?.length);
				const isActive = activeMainIndex === index;
				return (
					<div
						key={item.path}
						className="flex sidebar-collapsed:w-auto w-full flex-col sidebar-collapsed:items-center"
					>
						{showSectionHeader ? (
							<>
								<div
									className={cn(
										"px-2.5 pt-4 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
										index === 0 && "pt-1.5",
										EXPANDED_ONLY,
									)}
								>
									{item.section}
								</div>
								{index > 0 ? (
									<div
										className={cn(
											"my-2 h-[1px] w-6 self-center bg-stroke-soft-200",
											COLLAPSED_ONLY,
										)}
									/>
								) : null}
							</>
						) : null}
						<div
							className={cn(
								"relative z-10 flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5",
								hasSubNav ? "justify-between" : "justify-start",
								"sidebar-collapsed:w-8 sidebar-collapsed:justify-center sidebar-collapsed:gap-0 sidebar-collapsed:px-0",
								isActive && !activeSubInfo && "bg-neutral-alpha-10",
							)}
						>
							<span className="flex min-w-0 items-center gap-2.5 sidebar-collapsed:gap-0">
								<SidebarNavIcon
									name={item.iconName}
									isSpecial={item.isSpecial}
									isActive={isActive}
								/>
								<span
									className={cn(
										"truncate font-medium text-[13px]",
										isActive ? "text-text-strong-950" : "text-text-sub-600",
										EXPANDED_ONLY,
									)}
								>
									{item.label}
								</span>
							</span>
							{hasSubNav ? (
								<span
									className={cn(
										"flex h-5 w-5 items-center justify-center",
										EXPANDED_ONLY,
									)}
								>
									<Icon
										name="chevron-right"
										className={cn(
											"h-3 w-3 shrink-0 text-text-sub-600 opacity-60",
											expanded[item.path] && "rotate-90",
										)}
									/>
								</span>
							) : null}
						</div>
						{item.items && expanded[item.path] ? (
							<div
								className={cn(
									"my-0.5 ml-[17.5px] flex flex-col border-stroke-soft-200 border-l pb-0.5 pl-[9.5px]",
									EXPANDED_ONLY,
								)}
							>
								{item.items.map((sub, subIndex) => {
									const isSubActive =
										activeSubInfo?.mainPath === item.path &&
										activeSubInfo.subIndex === subIndex;
									return (
										<div
											key={sub.path}
											className={cn(
												"relative z-10 flex h-7 items-center gap-1.5 rounded-md px-2 font-medium text-[12px]",
												isSubActive
													? "bg-neutral-alpha-10 text-text-strong-950"
													: "text-text-sub-600",
											)}
										>
											<SidebarNavIcon
												name={sub.iconName}
												isActive={isSubActive}
												className="h-3.5 w-3.5"
											/>
											{sub.label}
										</div>
									);
								})}
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
}

/** Permission-gated rows use the pre-paint `<html>` flags (see settings-nav-cache). */
function settingsItemVisibility(item: SettingsNavigationItem): string | false {
	if (item.requiresBilling) return "hidden settings-billing:flex";
	if (item.requiresOrgAdmin || item.requiresTeamAdmin) {
		return "hidden settings-org-admin:flex";
	}
	return false;
}

/** Mirrors `SettingsSidebarItems` row-for-row for `/settings/*` loads. */
function LoadingSettingsNav({ pathWithoutSlug }: { pathWithoutSlug: string }) {
	return (
		<div className="relative flex w-full flex-col sidebar-collapsed:items-center">
			<div className="relative z-10 mb-4 flex h-8 sidebar-collapsed:w-8 w-full items-center justify-start sidebar-collapsed:justify-center gap-2.5 rounded-lg px-2.5 sidebar-collapsed:px-0">
				<span className="flex min-w-0 items-center gap-2.5 sidebar-collapsed:gap-0">
					<Icon
						name="arrow-left"
						className="h-4 w-4 shrink-0 text-text-sub-600 opacity-70"
					/>
					<span
						className={cn(
							"font-medium text-[13px] text-text-sub-600",
							EXPANDED_ONLY,
						)}
					>
						Back to app
					</span>
				</span>
			</div>

			{settingsNavigation.map((section, sectionIdx) => (
				<div
					key={section.section}
					className="flex sidebar-collapsed:w-auto w-full flex-col sidebar-collapsed:items-center"
				>
					<div
						className={cn(
							"px-2.5 pt-4 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em]",
							sectionIdx === 0 && "pt-1.5",
							EXPANDED_ONLY,
						)}
					>
						{section.section}
					</div>
					{sectionIdx > 0 ? (
						<div
							className={cn(
								"my-2 h-[1px] w-6 self-center bg-stroke-soft-200",
								COLLAPSED_ONLY,
							)}
						/>
					) : null}
					{section.items.map((item) => {
						const subItems = item.items ?? [];
						const inSection =
							item.path === "/settings"
								? pathWithoutSlug === "/settings"
								: pathWithoutSlug.startsWith(item.path);
						const activeSub = subItems.find((sub) =>
							pathWithoutSlug.startsWith(sub.path),
						);
						const isActive = inSection && !activeSub;
						const row = (
							<div
								key={item.path}
								className={cn(
									"relative z-10 flex h-8 w-full items-center justify-start gap-2.5 rounded-lg px-2.5",
									"sidebar-collapsed:w-8 sidebar-collapsed:justify-center sidebar-collapsed:gap-0 sidebar-collapsed:px-0",
									isActive && "bg-neutral-alpha-10",
									settingsItemVisibility(item),
								)}
							>
								<SidebarNavIcon name={item.iconName} isActive={isActive} />
								<span
									className={cn(
										"truncate font-medium text-[13px]",
										isActive ? "text-text-strong-950" : "text-text-sub-600",
										EXPANDED_ONLY,
									)}
								>
									{item.label}
								</span>
							</div>
						);
						if (!inSection || subItems.length === 0) return row;
						return (
							<div key={item.path} className="flex flex-col">
								{row}
								<div
									className={cn(
										"my-0.5 ml-[17.5px] flex flex-col border-stroke-soft-200 border-l pb-0.5 pl-[9.5px]",
										EXPANDED_ONLY,
									)}
								>
									{subItems.map((sub) => {
										const isSubActive = sub === activeSub;
										return (
											<div
												key={sub.path}
												className={cn(
													"relative z-10 flex h-7 items-center gap-1.5 rounded-md px-2 font-medium text-[12px]",
													isSubActive
														? "bg-neutral-alpha-10 text-text-strong-950"
														: "text-text-sub-600",
												)}
											>
												<SidebarNavIcon
													name={sub.iconName}
													isActive={isSubActive}
													className="h-3.5 w-3.5"
												/>
												{sub.label}
											</div>
										);
									})}
								</div>
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
}

/**
 * Static dashboard chrome for route-level and Suspense loading states.
 *
 * Must NOT use `useSearchParams`, org context, or other hooks that suspend
 * (`usePathname` is fine);
 * those are what cause hard-refresh flashes when the real shell is replaced by
 * a full-viewport spinner.
 *
 * Sidebar matches the real nav (no pulse skeletons). Hidden below `lg`
 * because the live shell also hides the rail on mobile.
 */
export function DashboardLoadingChrome() {
	const pathname = usePathname() ?? "/";
	const pathWithoutSlug = pathname.replace(/^\/dashboard/, "") || "/";
	// Live sidebar swaps to the settings nav on /settings/*; match it.
	const isSettingsRoute = pathWithoutSlug.startsWith("/settings");

	return (
		<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
			<div className="sticky top-0 z-10 hidden h-screen sidebar-collapsed:w-14 w-60 flex-col overflow-hidden border-stroke-soft-100 border-r bg-bg-white-0 lg:flex dark:border-stroke-soft-100/40 dark:bg-black">
				<div className="flex h-12 sidebar-collapsed:w-14 w-full items-center justify-start sidebar-collapsed:justify-center px-3 sidebar-collapsed:px-0">
					<a
						href="/home"
						aria-label="Reloop home"
						className={cn(
							"flex items-center gap-2 overflow-hidden whitespace-nowrap",
							EXPANDED_ONLY,
						)}
					>
						<Logo className="-ml-1 h-8 w-8 shrink-0" />
						<p className="font-semibold text-text-strong-950">Reloop</p>
						<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
							Beta
						</span>
					</a>
					<a
						href="/home"
						aria-label="Reloop home"
						className={cn("items-center justify-center", COLLAPSED_ONLY)}
					>
						<Logo className="h-7 w-7 shrink-0" />
					</a>
				</div>
				<div className="relative flex-1 overflow-y-auto overflow-x-hidden px-2 sidebar-collapsed:px-0 py-2">
					{isSettingsRoute ? (
						<LoadingSettingsNav pathWithoutSlug={pathWithoutSlug} />
					) : (
						<LoadingSidebarNav />
					)}
				</div>
				{/* Same footer as the live rail; setup banner is data-driven so it fades in later. */}
				<div className="mt-auto flex sidebar-collapsed:w-14 w-full shrink-0 flex-col sidebar-collapsed:items-center gap-2 px-2 sidebar-collapsed:px-0 py-3">
					<div className={cn("px-1", EXPANDED_ONLY)}>
						<ThemeToggle />
					</div>
					<div className={COLLAPSED_ONLY}>
						<CollapsedThemeToggle />
					</div>
				</div>
			</div>
			<main className="relative flex min-w-0 flex-1 overflow-hidden">
				<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
					<PageHeaderSkeleton />
					<div className="flex-1 overflow-y-auto">
						<DashboardContentSkeleton />
					</div>
				</div>
			</main>
		</div>
	);
}
