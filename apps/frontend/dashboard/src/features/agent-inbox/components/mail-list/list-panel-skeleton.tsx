import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import { MailListSkeleton } from "./mail-list-skeleton";

const sk = "bg-[var(--inbox-skeleton)]";

/** Full list panel: sticky header + search + category + rows. */
export function ListPanelSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex h-full min-h-0 flex-1 flex-col bg-panel-light dark:bg-panel-dark",
				className,
			)}
			aria-busy="true"
		>
			<span className="sr-only">Loading inbox list</span>
			<div className="sticky top-0 z-15 shrink-0">
				<div className="flex h-11 items-center gap-2 px-3">
					<Skeleton className={cn("size-4 shrink-0 rounded", sk)} />
					<Skeleton className={cn("h-5 w-20", sk)} />
					<div className="flex-1" />
					<Skeleton className={cn("size-8 shrink-0 rounded-lg", sk)} />
				</div>
				<div className="grid grid-cols-4 border-mail-border/50 border-b">
					{["a", "b", "c", "d"].map((id) => (
						<div
							key={id}
							className="flex items-center gap-2 border-mail-border/50 border-l px-4 py-4 first:border-l-0"
						>
							<Skeleton className={cn("size-4 shrink-0 rounded", sk)} />
							<Skeleton className={cn("h-4 w-16 rounded", sk)} />
						</div>
					))}
				</div>
			</div>
			<MailListSkeleton />
		</div>
	);
}
