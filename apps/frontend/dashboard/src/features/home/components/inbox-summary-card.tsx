import Link from "next/link";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import { useMailboxesQuery } from "#/features/emails/hooks/use-emails-query";
import {
	HomeCardBody,
	HomeCardHeader,
	HomeCardShell,
} from "./home-card-shell";

export function InboxSummaryCard({ enabled }: { enabled: boolean }) {
	const { data, isPending } = useMailboxesQuery(enabled);
	const mailboxes = data ?? [];
	const count = mailboxes.length;

	return (
		<HomeCardShell
			className="h-full"
			header={
				<HomeCardHeader>
					<div className="flex items-center gap-2">
						<Icon name="inbox" className="h-4 w-4 text-text-sub-600" />
						<h2 className="font-medium text-label-md text-text-strong-950">
							Inboxes
						</h2>
						<span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-bg-white-0 px-1.5 font-medium text-label-xs text-text-sub-600 dark:bg-white/[0.06]">
							{count}
						</span>
					</div>
					<Link
						href="/agent-inbox"
						className="inline-flex items-center gap-1 font-medium text-paragraph-sm text-text-sub-600 transition-colors hover:text-text-strong-950"
					>
						Open
						<Icon name="arrow-right" className="h-3.5 w-3.5" />
					</Link>
				</HomeCardHeader>
			}
		>
			<HomeCardBody className="min-h-[220px]">
				{isPending ? (
					<div className="space-y-0 px-5 py-2">
						{Array.from({ length: 4 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center justify-between border-stroke-soft-100 border-b py-3 last:border-b-0 dark:border-stroke-soft-100/40"
							>
								<div className="flex items-center gap-2.5">
									<Skeleton className="h-1.5 w-1.5 rounded-full" />
									<Skeleton className="h-4 w-36" />
								</div>
							</div>
						))}
					</div>
				) : count > 0 ? (
					<ul className="px-5">
						{mailboxes.slice(0, 5).map((mb) => (
							<li key={mb.id}>
								<Link
									href={`/inbox/${mb.id}`}
									className="group flex items-center gap-2.5 border-stroke-soft-100 border-b py-3 last:border-b-0 dark:border-stroke-soft-100/40"
								>
									<span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success-base" />
									<span className="min-w-0 truncate font-medium text-paragraph-sm text-text-strong-950 group-hover:underline">
										{mb.displayName || mb.email}
									</span>
									{mb.displayName ? (
										<span className="hidden truncate text-paragraph-xs text-text-soft-400 sm:inline">
											{mb.email}
										</span>
									) : null}
								</Link>
							</li>
						))}
					</ul>
				) : (
					<div className="flex h-full min-h-[220px] flex-col items-center justify-center px-6 py-8 text-center">
						<Icon name="inbox" className="h-6 w-6 text-text-soft-400" />
						<h3 className="mt-4 font-semibold text-label-md text-text-strong-950">
							No inboxes
						</h3>
						<p className="mt-1.5 max-w-[260px] text-paragraph-sm text-text-sub-600">
							Create an inbox address to send and receive email.
						</p>
						<Button.Root
							variant="neutral"
							mode="stroke"
							size="small"
							asChild
							className="mt-5 rounded-xl"
						>
							<Link href="/agent-inbox?modal=create-agent-mailbox">
								Create inbox
							</Link>
						</Button.Root>
					</div>
				)}
			</HomeCardBody>
		</HomeCardShell>
	);
}
