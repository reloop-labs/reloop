"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight, MoreHorizontal, Plus } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface BackendMessage {
	id: string;
	mailboxId: string;
	organizationId: string;
	fromEmail: string;
	fromName: string | null;
	toEmails: string[];
	subject: string | null;
	snippet: string | null;
	status: string;
	isRead: boolean;
	isSpam: boolean;
	createdAt: string | Date;
}

const formatRelativeTime = (date: string | Date): string => {
	const now = Date.now();
	const then = new Date(date).getTime();
	const diffSec = Math.floor((now - then) / 1000);
	if (diffSec < 60) return `${diffSec}s ago`;
	const diffMin = Math.floor(diffSec / 60);
	if (diffMin < 60) return `${diffMin}m ago`;
	const diffHr = Math.floor(diffMin / 60);
	if (diffHr < 24) return `${diffHr}h ago`;
	return `${Math.floor(diffHr / 24)}d ago`;
};

const getStatusColor = (status: string) => {
	if (status === "received" || status === "active")
		return "bg-success-base/10 text-success-base";
	if (status === "processing") return "bg-warning-base/10 text-warning-base";
	return "bg-bg-weak-50 text-text-sub-600 dark:bg-white/[0.06] dark:text-white/40";
};

export function AgentInboxCard() {
	const { activeOrganization } = useUserOrganization();

	const { data: inboxMessagesData } = useSWR<BackendMessage[]>(
		activeOrganization?.id ? "/api/inbox/v1/messages" : null,
	);

	const messages = inboxMessagesData ?? [];

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href="/agent-inbox"
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="inbox" className="h-4 w-4 shrink-0" />
					Email Inbox
				</Link>
				<div className="flex items-center gap-1.5">
					<Link
						href="/agent-inbox/create"
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<Plus className="h-3.5 w-3.5" />
					</Link>
					<button
						type="button"
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<MoreHorizontal className="h-3.5 w-3.5" />
					</button>
					<Link
						href="/agent-inbox"
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>

			{/* Body */}
			{messages.length > 0 ? (
				<div className="-mt-1.5 overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					{messages.slice(0, 5).map((msg) => (
						<Link
							key={msg.id}
							href={`/agent-inbox?message=${msg.id}`}
							className="group/row flex items-center gap-2 border-stroke-soft-100 border-b py-2.5 no-underline last:border-b-0 dark:border-white/5"
						>
							{/* Left: unread indicator + sender */}
							<div className="flex min-w-0 items-center gap-2">
								<span
									className={cn(
										"h-1.5 w-1.5 shrink-0 rounded-full",
										!msg.isRead ? "bg-primary-base" : "bg-transparent",
									)}
								/>
								<span className="truncate font-semibold text-text-strong-950 text-xs group-hover/row:underline dark:text-white">
									{msg.fromName || msg.fromEmail || "(Unknown)"}
								</span>
							</div>

							{/* Middle: subject */}
							<span className="hidden flex-1 truncate text-text-sub-600 text-xs sm:block dark:text-white/40">
								{msg.subject || "(No Subject)"}
							</span>

							{/* Right: relative time */}
							<span className="shrink-0 text-text-sub-600 text-xs tabular-nums underline decoration-dotted underline-offset-2 dark:text-white/40">
								{formatRelativeTime(msg.createdAt)}
							</span>
						</Link>
					))}
				</div>
			) : (
				<div className="-mt-1.5 flex h-[250px] flex-col items-center justify-center rounded-xl border border-stroke-soft-100 bg-white p-6 text-center shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
					<Icon
						name="inbox"
						className="h-6 w-6 text-text-sub-600 dark:text-white/40"
					/>
					<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
						Give your AI agents a real inbox
					</h4>
					<p className="mt-2 max-w-[300px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
						Create dedicated email addresses your agents can send and receive
						from, just like a human would
					</p>
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						asChild
						className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
					>
						<Link href="/agent-inbox/create">Create email inbox</Link>
					</Button.Root>
				</div>
			)}
		</div>
	);
}
