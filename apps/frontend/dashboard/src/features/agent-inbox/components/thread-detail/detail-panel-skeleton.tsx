import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

/** Mirrors ZeroThreadToolbar icon buttons. */
const ToolbarButtonSkeleton = () => (
	<Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
);

/** Mirrors ThreadHeader people / label chips. */
const ChipSkeleton = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-100 px-2 py-0.5 dark:border-stroke-soft-100/40",
			className,
		)}
	>
		<Skeleton className="h-4 w-4 shrink-0 rounded-full" />
		<Skeleton className="h-3 w-14 rounded" />
	</div>
);

/** Message list placeholder used while the full thread API is in flight. */
export const ThreadMessagesSkeleton = () => (
	<div aria-busy="true">
		<span className="sr-only">Loading conversation</span>

		{/* Expanded message (ZeroMailDisplay) */}
		<div className="relative flex-1 pb-2">
			<div className="mt-3 flex w-full items-start justify-between gap-3 px-4">
				<div className="flex w-full gap-3">
					<Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
					<div className="flex w-full items-center justify-between gap-2">
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className="h-4 w-28 rounded" />
								<Skeleton className="h-3 w-12 rounded" />
							</div>
							<div className="mt-1.5 flex items-center gap-1.5">
								<Skeleton className="h-3.5 w-6 rounded" />
								<Skeleton className="h-3.5 w-36 rounded" />
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-1">
							<Skeleton className="h-3 w-10 rounded" />
							<Skeleton className="h-7 w-7 rounded-md" />
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-2.5 px-4 pt-3 pl-[3.75rem]">
				<Skeleton className="h-4 w-full rounded" />
				<Skeleton className="h-4 w-[94%] rounded" />
				<Skeleton className="h-4 w-[88%] rounded" />
				<Skeleton className="h-4 w-[96%] rounded" />
				<Skeleton className="h-4 w-[72%] rounded" />
				<div className="pt-1" />
				<Skeleton className="h-4 w-[90%] rounded" />
				<Skeleton className="h-4 w-[84%] rounded" />
				<Skeleton className="h-4 w-[58%] rounded" />

				<div className="mt-3 mb-1 inline-flex items-center gap-1.5">
					<Skeleton className="h-7 w-20 rounded-full" />
					<Skeleton className="h-7 w-24 rounded-full" />
					<Skeleton className="h-7 w-20 rounded-full" />
				</div>
			</div>
		</div>

		{/* Collapsed earlier message preview */}
		<div className="border-stroke-soft-100 border-t pb-2 dark:border-stroke-soft-100/40">
			<div className="mt-3 flex w-full items-start gap-3 px-4">
				<Skeleton className="mt-0.5 h-8 w-8 shrink-0 rounded-full" />
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<Skeleton className="h-4 w-24 rounded" />
						<Skeleton className="h-3 w-10 shrink-0 rounded" />
					</div>
					<Skeleton className="mt-1.5 h-3.5 w-[75%] rounded" />
				</div>
			</div>
		</div>
	</div>
);

/**
 * Thread detail skeleton — mirrors current ThreadDetail shell:
 * toolbar → subject header → message row → indented body → reply actions.
 */
export const DetailPanelSkeleton = () => (
	<div
		className="relative flex h-full min-h-0 flex-col bg-bg-white-0 dark:bg-black"
		aria-busy="true"
	>
		<span className="sr-only">Loading message</span>

		{/* ZeroThreadToolbar */}
		<div className="flex h-11 shrink-0 items-center border-stroke-soft-100 border-b px-3 dark:border-stroke-soft-100/40">
			<div className="flex flex-1 items-center gap-2">
				<ToolbarButtonSkeleton />
			</div>
			<div className="flex items-center gap-1">
				<ToolbarButtonSkeleton />
				<ToolbarButtonSkeleton />
				<ToolbarButtonSkeleton />
				<ToolbarButtonSkeleton />
				<ToolbarButtonSkeleton />
				<ToolbarButtonSkeleton />
			</div>
		</div>

		<div className="min-h-0 flex-1 overflow-hidden">
			{/* ThreadHeader */}
			<div className="border-stroke-soft-100 border-b px-4 py-4 dark:border-stroke-soft-100/40">
				<Skeleton className="h-5 w-[68%] max-w-md rounded" />

				<div className="mt-2.5 flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-stroke-soft-100 px-2 py-0.5 dark:border-stroke-soft-100/40">
						<Skeleton className="size-2 shrink-0 rounded-full" />
						<Skeleton className="h-3 w-12 rounded" />
					</span>
					<div className="mx-0.5 h-3 w-px rounded-full bg-stroke-soft-100 dark:bg-stroke-soft-100/40" />
					<ChipSkeleton />
					<ChipSkeleton />
				</div>

				{/* AI Summary (collapsed) */}
				<div className="mt-3 max-w-3xl rounded-xl border border-stroke-soft-100 px-4 py-2 dark:border-stroke-soft-100/40">
					<div className="flex items-center gap-1">
						<Skeleton className="h-3 w-16 rounded" />
						<Skeleton className="h-3 w-3 rounded-sm" />
					</div>
				</div>
			</div>

			<ThreadMessagesSkeleton />
		</div>
	</div>
);

/** @deprecated Use DetailPanelSkeleton */
export const MailDisplaySkeleton = DetailPanelSkeleton;
