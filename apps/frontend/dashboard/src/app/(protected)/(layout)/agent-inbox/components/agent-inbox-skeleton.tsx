"use client";

import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";

export const AgentInboxSkeleton = () => {
	return (
		<div className="flex h-[calc(100vh-54px)] animate-pulse flex-col overflow-hidden pb-0">
			{/* Page Top Bar Skeleton */}
			<div className="flex shrink-0 items-center justify-between border-stroke-soft-100 border-b px-4 pt-2 pb-2 dark:border-stroke-soft-100/40">
				<div className="flex items-center gap-3">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/40">
						<Icon name="arrow-left" className="h-4 w-4 text-text-soft-400" />
					</div>
					<Skeleton className="h-5 w-48 rounded" />
				</div>

				<div className="flex items-center gap-1">
					<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
					<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
					<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
					<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
				</div>
			</div>

			{/* Filter Tabs Skeleton */}
			<div className="flex shrink-0 items-center gap-2 border-stroke-soft-100 border-b px-4 py-2 dark:border-stroke-soft-100/40">
				<Skeleton className="h-8 w-24 rounded-lg" />
				<Skeleton className="h-8 w-24 rounded-lg" />
			</div>

			{/* Split Layout Skeleton */}
			<div className="flex min-h-0 flex-1 gap-0">
				{/* Left Pane: Thread List Skeleton */}
				<div className="hidden min-h-0 min-w-0 shrink-0 flex-col pr-4 pl-4 md:flex md:w-[380px] lg:w-[440px]">
					{/* Search input placeholder */}
					<div className="pt-4 pb-4">
						<Skeleton className="h-8 w-full rounded-[10px]" />
					</div>

					{/* Skeletons for Thread Cards */}
					<div className="flex flex-col gap-3 overflow-hidden">
						{[1, 2, 3, 4].map((i) => (
							<div
								key={i}
								className="flex flex-col gap-2 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
							>
								<div className="flex items-start gap-3">
									<div className="h-9 w-9 shrink-0 rounded-full bg-bg-weak-50/50 dark:bg-white/5" />
									<div className="flex min-w-0 flex-1 flex-col gap-1.5">
										<div className="flex items-center justify-between">
											<Skeleton className="h-4 w-24 rounded" />
											<Skeleton className="h-3 w-8 rounded" />
										</div>
										<Skeleton className="h-4 w-40 rounded" />
										<Skeleton className="h-3 w-full rounded" />
										<Skeleton className="h-3 w-2/3 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Right Pane: Thread Detail Skeleton */}
				<div className="flex min-w-0 flex-1 flex-col border-stroke-soft-100 border-l bg-bg-white-0 dark:border-stroke-soft-100/40 dark:bg-bg-white-0/5">
					{/* Header Skeleton */}
					<div className="flex shrink-0 items-center justify-between border-stroke-soft-100 border-b px-6 py-4 dark:border-stroke-soft-100/40">
						<div className="flex items-center gap-2">
							<div className="h-8 w-8 rounded-full bg-bg-weak-50/50 dark:bg-white/5" />
							<div className="flex flex-col gap-1">
								<Skeleton className="h-3 w-24 rounded" />
								<Skeleton className="h-2.5 w-32 rounded" />
							</div>
						</div>
						<div className="flex items-center gap-1">
							<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
							<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
							<div className="h-8 w-8 rounded-lg bg-bg-weak-50/50 dark:bg-white/5" />
						</div>
					</div>

					{/* Detail Body Skeleton */}
					<div className="flex flex-1 flex-col gap-4 p-6">
						<div className="flex items-center gap-3">
							<div className="h-10 w-10 rounded-full bg-bg-weak-50/50 dark:bg-white/5" />
							<div className="flex flex-col gap-1.5">
								<Skeleton className="h-4 w-36 rounded" />
								<Skeleton className="h-3 w-48 rounded" />
							</div>
						</div>
						<div className="space-y-2.5 pt-4">
							<Skeleton className="h-4 w-full rounded" />
							<Skeleton className="h-4 w-full rounded" />
							<Skeleton className="h-4 w-[90%] rounded" />
							<Skeleton className="h-4 w-[85%] rounded" />
							<Skeleton className="h-4 w-[40%] rounded" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
