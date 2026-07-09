"use client";

import { Skeleton } from "@reloop/ui/skeleton";
import { cn } from "@reloop/ui/cn";

/** Centered spinner used for mail list initial load (Zero pattern). */
export const MailListSpinner = ({ className }: { className?: string }) => (
	<div
		className={cn(
			"flex h-32 w-full items-center justify-center",
			className,
		)}
	>
		<div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-white dark:border-t-transparent" />
	</div>
);

const MailMessageSkeleton = () => (
	<div className="relative flex-1 overflow-hidden p-4">
		<div className="relative inset-0 h-full overflow-y-auto pb-0">
			<div className="flex flex-col gap-4">
				<div className="flex items-start justify-between gap-4">
					<div className="flex items-start gap-4">
						<Skeleton className="h-10 w-10 rounded-md bg-[var(--inbox-muted-bg)]" />
						<div className="flex-1 space-y-2">
							<div className="flex items-center gap-2">
								<Skeleton className="h-5 w-32 bg-[var(--inbox-muted-bg)]" />
								<Skeleton className="h-4 w-48 bg-[var(--inbox-muted-bg)]" />
							</div>
							<div className="flex items-center gap-2">
								<Skeleton className="h-3 w-24 bg-[var(--inbox-muted-bg)]" />
								<Skeleton className="h-3 w-16 bg-[var(--inbox-muted-bg)]" />
							</div>
						</div>
					</div>
					<Skeleton className="h-6 w-6 bg-[var(--inbox-muted-bg)]" />
				</div>
				<Skeleton className="h-px w-full bg-[var(--inbox-muted-bg)]" />
				<div className="space-y-4">
					<div className="flex flex-col space-y-2">
						<Skeleton className="h-4 w-full bg-[var(--inbox-muted-bg)]" />
						<Skeleton className="h-4 w-[90%] bg-[var(--inbox-muted-bg)]" />
						<Skeleton className="h-4 w-[95%] bg-[var(--inbox-muted-bg)]" />
					</div>
					<div className="flex flex-col space-y-2">
						<Skeleton className="h-4 w-[88%] bg-[var(--inbox-muted-bg)]" />
						<Skeleton className="h-4 w-[92%] bg-[var(--inbox-muted-bg)]" />
						<Skeleton className="h-4 w-[85%] bg-[var(--inbox-muted-bg)]" />
					</div>
				</div>
			</div>
		</div>
	</div>
);

/** Thread detail skeleton — three faux message blocks (Zero `MailDisplaySkeleton`). */
export const MailDisplaySkeleton = () => (
	<div className="flex min-h-0 flex-1 flex-col overflow-hidden">
		<div className="min-h-0 flex-1 overflow-y-auto pb-4">
			<MailMessageSkeleton />
			<div className="mx-4 h-px bg-mail-border" />
			<MailMessageSkeleton />
			<div className="mx-4 h-px bg-mail-border" />
			<MailMessageSkeleton />
		</div>
	</div>
);
