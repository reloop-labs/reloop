import { cn } from "@reloop/ui/cn";
import { Skeleton } from "@reloop/ui/skeleton";

const sk = "bg-[var(--inbox-skeleton)]";

/** Avatar stack placeholder for the mailbox rail. */
export function MailboxRailSkeleton({
	className,
	count = 4,
}: {
	className?: string;
	count?: number;
}) {
	return (
		<div
			className={cn(
				"flex min-h-0 w-full flex-1 flex-col items-center gap-2 pt-0.5",
				className,
			)}
			aria-busy="true"
		>
			<span className="sr-only">Loading mailboxes</span>
			{Array.from({ length: count }, (_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
				<Skeleton key={i} className={cn("size-7 shrink-0 rounded-lg", sk)} />
			))}
		</div>
	);
}
