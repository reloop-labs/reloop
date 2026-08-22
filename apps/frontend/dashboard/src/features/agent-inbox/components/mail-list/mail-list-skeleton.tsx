import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

const NAME_WIDTHS = [
	"w-24",
	"w-28",
	"w-20",
	"w-32",
	"w-16",
	"w-28",
	"w-20",
	"w-36",
];
const SUBJECT_WIDTHS = [
	"w-36",
	"w-44",
	"w-28",
	"w-40",
	"w-48",
	"w-32",
	"w-40",
	"w-36",
];
const PREVIEW_WIDTHS = [
	"w-[40%]",
	"w-[55%]",
	"w-[35%]",
	"w-[50%]",
	"w-[45%]",
	"w-[60%]",
	"w-[30%]",
	"w-[48%]",
];

const MailListRowSkeleton = ({ index }: { index: number }) => (
	<div className="flex h-11 items-center border-stroke-soft-100 border-b pr-6 pl-4 transition-colors dark:border-stroke-soft-100/40">
		{/* Checkbox */}
		<span className="flex w-5 shrink-0 justify-center">
			<Skeleton className="size-4 rounded" />
		</span>

		{/* Star */}
		<span className="ml-1.5 flex w-5 shrink-0 justify-center">
			<Skeleton className="size-3.5 rounded" />
		</span>

		{/* Sender */}
		<span
			className="ml-3 flex items-center pr-4"
			style={{ width: "clamp(120px, 20%, 180px)" }}
		>
			<Skeleton
				className={cn("h-3.5 rounded", NAME_WIDTHS[index % NAME_WIDTHS.length])}
			/>
		</span>

		{/* Subject & Preview */}
		<div className="flex min-w-0 flex-1 items-center gap-2 pr-3">
			<Skeleton
				className={cn(
					"h-3.5 shrink-0 rounded",
					SUBJECT_WIDTHS[index % SUBJECT_WIDTHS.length],
				)}
			/>
			<Skeleton
				className={cn(
					"h-3 rounded opacity-60",
					PREVIEW_WIDTHS[index % PREVIEW_WIDTHS.length],
				)}
			/>
		</div>

		{/* Date */}
		<Skeleton className="ml-2 h-3 w-14 shrink-0 rounded" />
	</div>
);

/** Thread list placeholder — mirrors dense Superhuman-style InboxThreadRow. */
export const MailListSkeleton = ({
	className,
	rows = 14,
}: {
	className?: string;
	rows?: number;
}) => (
	<div
		className={cn("flex h-full min-h-0 w-full flex-1 flex-col", className)}
		aria-busy="true"
	>
		<span className="sr-only">Loading messages</span>
		{Array.from({ length: rows }, (_, i) => (
			// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows
			<MailListRowSkeleton key={i} index={i} />
		))}
	</div>
);
