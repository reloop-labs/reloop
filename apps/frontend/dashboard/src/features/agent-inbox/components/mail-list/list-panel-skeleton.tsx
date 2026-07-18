import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import { MailListSkeleton } from "./mail-list-skeleton";

const sk = "bg-[var(--inbox-skeleton)]";

/** Full list panel: sticky header + search + category + rows. */
export function ListPanelSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex h-full min-h-0 flex-1 flex-col bg-panel-light md:rounded-2xl dark:bg-panel-dark",
				className,
			)}
			aria-busy="true"
		>
			<span className="sr-only">Loading inbox list</span>
			<div className="sticky top-0 z-15 shrink-0 space-y-3 p-4 pb-2">
				<div className="flex items-center gap-2">
					<Skeleton className={cn("h-8 w-8 shrink-0 rounded-lg", sk)} />
					<Skeleton className={cn("h-5 w-24", sk)} />
					<div className="flex-1" />
					<Skeleton className={cn("h-8 w-8 shrink-0 rounded-lg", sk)} />
				</div>
				<Skeleton className={cn("h-9 w-full rounded-xl", sk)} />
				<div className="flex items-center gap-2">
					<Skeleton className={cn("h-7 w-16 rounded-full", sk)} />
					<Skeleton className={cn("h-7 w-14 rounded-full", sk)} />
					<Skeleton className={cn("h-7 w-16 rounded-full", sk)} />
					<Skeleton className={cn("h-7 w-12 rounded-full", sk)} />
				</div>
			</div>
			<MailListSkeleton />
		</div>
	);
}
