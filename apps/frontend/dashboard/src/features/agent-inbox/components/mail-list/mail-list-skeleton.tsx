import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

const sk = "bg-[var(--inbox-skeleton)]";

const NAME_WIDTHS = [
	"w-28",
	"w-36",
	"w-24",
	"w-32",
	"w-40",
	"w-28",
	"w-20",
	"w-36",
];
const SNIPPET_WIDTHS = [
	"w-[88%]",
	"w-[72%]",
	"w-[94%]",
	"w-[80%]",
	"w-[66%]",
	"w-[90%]",
	"w-[75%]",
	"w-[85%]",
];

const MailListRowSkeleton = ({ index }: { index: number }) => (
	<div className="mx-[8px] flex flex-col items-start rounded-[18px] py-3">
		<div className="flex w-full items-start justify-between gap-3 px-4">
			<Skeleton className={cn("mt-0.5 h-9 w-9 shrink-0 rounded-full", sk)} />
			<div className="min-w-0 flex-1">
				<div className="flex w-full flex-row items-start justify-between gap-2">
					<Skeleton
						className={cn("h-4", NAME_WIDTHS[index % NAME_WIDTHS.length], sk)}
					/>
					<Skeleton className={cn("h-3 w-10 shrink-0", sk)} />
				</div>
				<div className="mt-1.5">
					<Skeleton
						className={cn(
							"h-3.5",
							SNIPPET_WIDTHS[index % SNIPPET_WIDTHS.length],
							sk,
						)}
					/>
				</div>
			</div>
		</div>
	</div>
);

/** Thread list placeholder — mirrors InboxThreadRow layout. */
export const MailListSkeleton = ({
	className,
	rows = 8,
}: {
	className?: string;
	rows?: number;
}) => (
	<div
		className={cn("flex h-full min-h-0 w-full flex-1 flex-col pt-1", className)}
		aria-busy="true"
	>
		<span className="sr-only">Loading messages</span>
		{Array.from({ length: rows }, (_, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
			<MailListRowSkeleton key={i} index={i} />
		))}
	</div>
);
