"use client";

import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

/** Centered spinner used for mail list initial load (Zero pattern). */
export const MailListSpinner = ({ className }: { className?: string }) => (
	<div
		className={cn("flex h-32 w-full items-center justify-center", className)}
	>
		<div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
	</div>
);

const sk = "bg-[var(--inbox-muted-bg)]";

/**
 * Thread detail skeleton — mirrors ZeroMailDisplay:
 * subject header + sender row + body lines (no toolbar, like Zero).
 */
export const MailDisplaySkeleton = () => (
	<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
		<div className="min-h-0 flex-1 overflow-y-auto pb-4">
			{/* Subject header */}
			<div className="border-mail-border border-b px-4 py-4">
				<Skeleton className={cn("h-5 w-[70%] max-w-md", sk)} />
				<div className="mt-2 flex items-center gap-1.5">
					<Skeleton className={cn("h-3.5 w-3.5 rounded", sk)} />
					<Skeleton className={cn("h-5 w-28 rounded-md", sk)} />
				</div>
			</div>

			{/* Message block */}
			<div className="flex flex-col pb-2">
				<div className="mt-3 flex w-full items-start gap-4 px-4">
					<Skeleton className={cn("mt-1 h-8 w-8 shrink-0 rounded-full", sk)} />
					<div className="min-w-0 flex-1 space-y-2">
						<div className="flex items-center justify-between gap-2">
							<div className="flex items-center gap-2">
								<Skeleton className={cn("h-4 w-28", sk)} />
								<Skeleton className={cn("h-3 w-12", sk)} />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className={cn("h-3 w-14", sk)} />
								<Skeleton className={cn("h-7 w-7 rounded-md", sk)} />
							</div>
						</div>
						<Skeleton className={cn("h-3.5 w-24", sk)} />
					</div>
				</div>

				<div className="space-y-2.5 px-4 pt-4 pb-4">
					<Skeleton className={cn("h-4 w-full", sk)} />
					<Skeleton className={cn("h-4 w-[92%]", sk)} />
					<Skeleton className={cn("h-4 w-[88%]", sk)} />
					<Skeleton className={cn("h-4 w-[95%]", sk)} />
					<Skeleton className={cn("h-4 w-[70%]", sk)} />
					<div className="pt-2" />
					<Skeleton className={cn("h-4 w-[85%]", sk)} />
					<Skeleton className={cn("h-4 w-[90%]", sk)} />
					<Skeleton className={cn("h-4 w-[60%]", sk)} />
				</div>
			</div>
		</div>
	</div>
);
