import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

const sk = "bg-[var(--inbox-skeleton)]";

const NAME_WIDTHS = [
	"w-20",
	"w-28",
	"w-24",
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
	<div className="flex items-center border-[var(--inbox-divider)] border-b pt-[10px] pr-6 pb-[10px] pl-4">
		<span className="ml-1 flex w-5 shrink-0 justify-center">
			<span className="size-2 rounded-full bg-[var(--inbox-skeleton)] opacity-40" />
		</span>
		<span
			className="ml-1.5 flex items-center pr-3"
			style={{ width: "clamp(80px, 22%, 176px)" }}
		>
			<Skeleton
				className={cn("h-3.5", NAME_WIDTHS[index % NAME_WIDTHS.length], sk)}
			/>
		</span>
		<span className="mr-3 flex min-w-0 flex-1 items-center gap-2">
			<Skeleton
				className={cn(
					"h-3.5 shrink-0",
					SUBJECT_WIDTHS[index % SUBJECT_WIDTHS.length],
					sk,
				)}
			/>
			<Skeleton
				className={cn("h-3", PREVIEW_WIDTHS[index % PREVIEW_WIDTHS.length], sk)}
			/>
		</span>
		<Skeleton className={cn("ml-1 h-3 w-[48px] shrink-0", sk)} />
	</div>
);

/** Thread list placeholder — mirrors dense Superhuman-style InboxThreadRow. */
export const MailListSkeleton = ({
	className,
	rows = 12,
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
