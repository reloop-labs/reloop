import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

const sk = "bg-[var(--inbox-skeleton)]";

/** Mirrors ZeroThreadToolbar icon buttons. */
const ToolbarButtonSkeleton = () => (
	<Skeleton className={cn("h-7 w-7 shrink-0 rounded-lg", sk)} />
);

/** Mirrors ThreadHeader people / label chips. */
const ChipSkeleton = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"inline-flex items-center gap-1.5 rounded-full border border-mail-border/40 bg-panel-light p-1 pr-2 dark:bg-panel-dark",
			className,
		)}
	>
		<Skeleton className={cn("h-5 w-5 shrink-0 rounded-full", sk)} />
		<Skeleton className={cn("h-3 w-14", sk)} />
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
					<Skeleton
						className={cn("mt-0.5 h-8 w-8 shrink-0 rounded-full", sk)}
					/>
					<div className="flex w-full items-center justify-between gap-2">
						<div className="min-w-0 flex-1">
							<div className="flex flex-wrap items-center gap-2">
								<Skeleton className={cn("h-4 w-28", sk)} />
								<Skeleton className={cn("h-3 w-12", sk)} />
							</div>
							<div className="mt-1.5 flex items-center gap-1.5">
								<Skeleton className={cn("h-3.5 w-6", sk)} />
								<Skeleton className={cn("h-3.5 w-36", sk)} />
							</div>
						</div>
						<div className="flex shrink-0 items-center gap-1">
							<Skeleton className={cn("h-3 w-10", sk)} />
							<Skeleton className={cn("h-7 w-7 rounded-md", sk)} />
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-2.5 px-4 pt-3 pl-[3.75rem]">
				<Skeleton className={cn("h-4 w-full", sk)} />
				<Skeleton className={cn("h-4 w-[94%]", sk)} />
				<Skeleton className={cn("h-4 w-[88%]", sk)} />
				<Skeleton className={cn("h-4 w-[96%]", sk)} />
				<Skeleton className={cn("h-4 w-[72%]", sk)} />
				<div className="pt-1" />
				<Skeleton className={cn("h-4 w-[90%]", sk)} />
				<Skeleton className={cn("h-4 w-[84%]", sk)} />
				<Skeleton className={cn("h-4 w-[58%]", sk)} />

				<div className="mt-3 mb-1 inline-flex items-center gap-0.5">
					<Skeleton className={cn("h-8 w-[4.5rem] rounded-full", sk)} />
					<Skeleton className={cn("h-8 w-[5.25rem] rounded-full", sk)} />
					<Skeleton className={cn("h-8 w-[5rem] rounded-full", sk)} />
				</div>
			</div>
		</div>

		{/* Collapsed earlier message preview */}
		<div className="border-mail-border/30 border-t pb-2">
			<div className="mt-3 flex w-full items-start gap-3 px-4">
				<Skeleton className={cn("mt-0.5 h-8 w-8 shrink-0 rounded-full", sk)} />
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<Skeleton className={cn("h-4 w-24", sk)} />
						<Skeleton className={cn("h-3 w-10 shrink-0", sk)} />
					</div>
					<Skeleton className={cn("mt-1.5 h-3.5 w-[75%]", sk)} />
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
		className="relative flex h-full min-h-0 flex-col bg-panel-light dark:bg-panel-dark"
		aria-busy="true"
	>
		<span className="sr-only">Loading message</span>

		{/* ZeroThreadToolbar */}
		<div className="flex h-11 shrink-0 items-center px-3">
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
			<div className="border-mail-border/40 border-b px-4 py-4">
				<Skeleton className={cn("h-5 w-[68%] max-w-md", sk)} />

				<div className="mt-2.5 flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1.5 rounded-full border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-2 py-0.5">
						<Skeleton className={cn("size-2 shrink-0 rounded-full", sk)} />
						<Skeleton className={cn("h-3 w-12", sk)} />
					</span>
					<div className="mx-0.5 h-3 w-px rounded-full bg-mail-border" />
					<ChipSkeleton />
					<ChipSkeleton />
				</div>

				{/* AI Summary (collapsed) */}
				<div className="mt-3 max-w-3xl rounded-xl border border-mail-border/40 bg-[var(--inbox-muted-bg)] px-4 py-2">
					<div className="flex items-center gap-1">
						<Skeleton className={cn("h-3 w-16", sk)} />
						<Skeleton className={cn("h-3 w-3 rounded-sm", sk)} />
					</div>
				</div>
			</div>

			<ThreadMessagesSkeleton />
		</div>
	</div>
);

/** @deprecated Use DetailPanelSkeleton */
export const MailDisplaySkeleton = DetailPanelSkeleton;
