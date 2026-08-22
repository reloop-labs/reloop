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
		<span className="ml-1 flex w-5 shrink-0 justify-center">
			<Skeleton className="size-4 rounded" />
		</span>

		{/* Unread indicator */}
		<span className="flex w-3 shrink-0 items-center justify-center">
			{index % 3 === 0 && <Skeleton className="size-1.5 rounded-full" />}
		</span>

		{/* Sender */}
		<span
			className="ml-1.5 flex items-center pr-3"
			style={{ width: "clamp(80px, 22%, 176px)" }}
		>
			<Skeleton
				className={cn("h-3.5 rounded", NAME_WIDTHS[index % NAME_WIDTHS.length])}
			/>
		</span>

		{/* Subject & Preview */}
		<span className="mr-3 flex min-w-0 flex-1 items-center gap-2">
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
		</span>

		{/* Date */}
		<Skeleton className="ml-1 h-3 w-[44px] shrink-0 rounded" />
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
