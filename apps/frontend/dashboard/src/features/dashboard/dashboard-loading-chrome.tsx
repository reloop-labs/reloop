"use client";

import { Logo } from "@reloop/ui/logo";
import { DashboardContentSkeleton } from "./dashboard-content-skeleton";
import { mainNavigation } from "./navigation";
import { SidebarNavIcon } from "./sidebar/sidebar-nav-icon";

function LoadingSidebarNav() {
	return (
		<div className="relative flex w-full flex-col">
			{mainNavigation.map((item, index) => {
				if (item.path === "/ai") return null;
				const prevItem = index > 0 ? mainNavigation[index - 1] : null;
				const showSectionHeader =
					item.section && (!prevItem || prevItem.section !== item.section);
				return (
					<div key={item.path} className="flex w-full flex-col">
						{showSectionHeader ? (
							<div
								className={`px-2.5 pt-4 pb-1.5 font-semibold text-[10px] text-text-soft-400 uppercase tracking-[0.06em] ${index === 0 ? "pt-1.5" : ""}`}
							>
								{item.section}
							</div>
						) : null}
						<div className="relative z-10 flex h-8 w-full items-center justify-start gap-2.5 px-2.5">
							<SidebarNavIcon name={item.iconName} isSpecial={item.isSpecial} />
							<span className="truncate font-medium text-[13px] text-text-sub-600">
								{item.label}
							</span>
						</div>
					</div>
				);
			})}
		</div>
	);
}

/**
 * Static dashboard chrome for route-level and Suspense loading states.
 *
 * Must NOT use `useSearchParams`, org context, or other hooks that suspend —
 * those are what cause hard-refresh flashes when the real shell is replaced by
 * a full-viewport spinner.
 *
 * Sidebar matches the real nav (no pulse skeletons). Hidden below `lg`
 * because the live shell also hides the rail on mobile.
 */
export function DashboardLoadingChrome() {
	return (
		<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
			<div className="sticky top-0 z-10 hidden h-screen w-60 flex-col border-stroke-soft-100 border-r bg-bg-white-0 lg:flex dark:border-stroke-soft-100/40 dark:bg-black">
				<div className="flex h-12 items-center justify-start px-3">
					<a
						href="/home"
						aria-label="Reloop home"
						className="flex items-center gap-2 overflow-hidden whitespace-nowrap"
					>
						<Logo className="-ml-1 h-8 w-8 shrink-0" />
						<p className="font-semibold text-text-strong-950">Reloop</p>
						<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
							Beta
						</span>
					</a>
				</div>
				<div className="relative flex-1 overflow-y-auto overflow-x-hidden px-2 py-2">
					<LoadingSidebarNav />
				</div>
			</div>
			<main className="relative flex min-w-0 flex-1 overflow-hidden">
				<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
					<div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-3 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2">
							<div className="h-7 w-7" />
						</div>
					</div>
					<div className="flex-1 overflow-y-auto">
						<DashboardContentSkeleton />
					</div>
				</div>
			</main>
		</div>
	);
}
