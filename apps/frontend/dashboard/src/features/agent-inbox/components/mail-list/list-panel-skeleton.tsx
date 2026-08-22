import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";
import { MailListSkeleton } from "./mail-list-skeleton";

/** Full list panel: sticky header + search + category + rows. */
export function ListPanelSkeleton({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"flex h-full min-h-0 flex-1 flex-col bg-bg-white-0 dark:bg-black",
				className,
			)}
			aria-busy="true"
		>
			<span className="sr-only">Loading inbox list</span>
			<div className="sticky top-0 z-15 shrink-0 bg-bg-white-0 dark:bg-black">
				<div className="flex h-11 items-center pr-6 pl-4">
					<span className="ml-1 flex w-5 shrink-0 items-center justify-center">
						<Skeleton className="size-4 rounded" />
					</span>
					<div className="flex-1" />
					<Skeleton className="size-8 shrink-0 rounded-lg" />
				</div>
				<div className="grid h-12 w-full grid-cols-4 border-stroke-soft-100 border-y dark:border-stroke-soft-100/40">
					{["All", "Unread", "To review", "Starred"].map((id) => (
						<div
							key={id}
							className="flex h-full w-full items-center justify-start gap-2.5 border-stroke-soft-100 border-l px-4 first:border-l-0 sm:px-5 dark:border-stroke-soft-100/40"
						>
							<Skeleton className="size-4 shrink-0 rounded" />
							<Skeleton className="h-3.5 w-14 rounded" />
						</div>
					))}
				</div>
			</div>
			<MailListSkeleton />
		</div>
	);
}
