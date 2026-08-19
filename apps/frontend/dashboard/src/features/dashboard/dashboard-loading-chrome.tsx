import { Logo } from "@reloop/ui/logo";
import { DashboardContentSkeleton } from "./dashboard-content-skeleton";

/**
 * Static dashboard chrome for route-level and Suspense loading states.
 *
 * Must NOT use `useSearchParams`, org context, or other hooks that suspend —
 * those are what cause hard-refresh flashes when the real shell is replaced by
 * a full-viewport spinner.
 */
export function DashboardLoadingChrome() {
	return (
		<div className="flex h-screen overflow-hidden bg-bg-white-0 dark:bg-black">
			<div className="sticky top-0 z-10 flex h-screen w-60 flex-col border-stroke-soft-100 border-r dark:border-white/10">
				<div className="flex h-12 items-center justify-between pr-3 pl-3">
					<div className="flex items-center gap-2">
						<Logo className="-ml-1 w-10" />
						<p className="-ml-2 font-semibold text-text-strong-950">Reloop</p>
						<span className="inline-flex items-center rounded-full bg-bg-weak-50 px-2 py-0.5 font-bold text-[8px] text-text-sub-600 uppercase tracking-wide dark:bg-white/[0.06]">
							Beta
						</span>
					</div>
				</div>
				<div className="flex flex-1 flex-col gap-2 px-4 py-3">
					<div className="h-8 w-full animate-pulse rounded-lg bg-bg-weak-50 dark:bg-white/[0.04]" />
					<div className="h-8 w-4/5 animate-pulse rounded-lg bg-bg-weak-50 dark:bg-white/[0.04]" />
					<div className="h-8 w-3/5 animate-pulse rounded-lg bg-bg-weak-50 dark:bg-white/[0.04]" />
					<div className="mt-2 h-8 w-full animate-pulse rounded-lg bg-bg-weak-50 dark:bg-white/[0.04]" />
					<div className="h-8 w-2/3 animate-pulse rounded-lg bg-bg-weak-50 dark:bg-white/[0.04]" />
				</div>
			</div>
			<main className="relative flex min-w-0 flex-1 overflow-hidden">
				<div className="flex min-w-0 flex-1 flex-col overflow-hidden">
					<div className="sticky top-0 z-10 flex h-11 shrink-0 items-center justify-between border-stroke-soft-100 border-b pr-3 pl-3 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2">
							<div className="h-5 w-5 animate-pulse rounded-[6px] bg-bg-weak-50 dark:bg-white/[0.06]" />
							<div className="h-3.5 w-24 animate-pulse rounded bg-bg-weak-50 dark:bg-white/[0.06]" />
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
