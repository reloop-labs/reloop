"use client";

import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

interface EmailLogData {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
}

interface EmailListResponse {
	object: "list";
	data: EmailLogData[];
	total: number;
	page: number;
	limit: number;
}

interface BackendMessage {
	id: string;
	mailboxId: string;
	fromEmail: string;
	fromName: string | null;
	subject: string | null;
	status: string;
	createdAt: string | Date;
}

export function EmailsCard() {
	const { activeOrganization } = useUserOrganization();
	const [activeTab, setActiveTab] = useState<"sent" | "received">("sent");

	// Fetch Sent logs
	const { data: emailLogsData } = useSWR<EmailListResponse>(
		activeOrganization?.id ? "/api/logs/v1/emails?limit=5&page=1" : null,
	);

	// Fetch Received logs
	const { data: messagesData } = useSWR<BackendMessage[]>(
		activeOrganization?.id ? "/api/inbox/v1/messages" : null,
	);

	const headerHref = activeTab === "sent" ? "/emails" : "/agent-inbox";
	const plusHref =
		activeTab === "sent" ? "/emails/send" : "/agent-inbox/create";

	const hasSentLogs = emailLogsData?.data && emailLogsData.data.length > 0;
	const hasReceivedMessages = messagesData && messagesData.length > 0;

	return (
		<div className="group flex w-full flex-col">
			{/* Header */}
			<div className="flex items-center justify-between rounded-t-2xl border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-5 pt-1.5 pb-3 dark:border-white/5 dark:bg-white/[0.02]">
				<Link
					href={headerHref}
					className="flex items-center gap-2 font-medium text-sm text-text-sub-600 transition-colors hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
				>
					<Icon name="mail-single" className="h-4 w-4 shrink-0" />
					<span>Emails</span>
				</Link>

				<div className="flex items-center gap-1.5">
					<Link
						href={plusHref}
						className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-white text-text-sub-600 transition-colors hover:bg-bg-weak-50/50 hover:text-text-strong-950 dark:border-white/5 dark:bg-white/[0.02] dark:text-white/60"
					>
						<Plus className="h-3.5 w-3.5" />
					</Link>
					<Link
						href={headerHref}
						className="flex h-7 w-7 shrink-0 items-center justify-center text-text-sub-600 transition-transform hover:translate-x-0.5 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white"
					>
						<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
					</Link>
				</div>
			</div>

			{/* Body Container */}
			<div className="-mt-1.5 flex h-[250px] flex-col overflow-hidden rounded-xl border border-stroke-soft-100 bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] dark:border-white/5 dark:bg-white/[0.02]">
				{/* Tab Selector */}
				<div className="flex shrink-0 border-stroke-soft-100/50 border-b pt-3 pb-2 dark:border-white/5">
					<div className="flex w-full rounded-lg bg-bg-weak-50 p-1 dark:bg-white/[0.02]">
						<button
							type="button"
							onClick={() => setActiveTab("sent")}
							className={cn(
								"flex-1 rounded-md py-1 text-center font-semibold text-xs transition-all",
								activeTab === "sent"
									? "bg-white text-text-strong-950 shadow-sm dark:bg-white/10 dark:text-white"
									: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
							)}
						>
							Sent
						</button>
						<button
							type="button"
							onClick={() => setActiveTab("received")}
							className={cn(
								"flex-1 rounded-md py-1 text-center font-semibold text-xs transition-all",
								activeTab === "received"
									? "bg-white text-text-strong-950 shadow-sm dark:bg-white/10 dark:text-white"
									: "text-text-sub-600 hover:text-text-strong-950 dark:text-white/60 dark:hover:text-white",
							)}
						>
							Received
						</button>
					</div>
				</div>

				{/* List or Empty State */}
				<div className="min-h-0 flex-1 overflow-y-auto">
					{activeTab === "sent" ? (
						hasSentLogs ? (
							<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
								{emailLogsData.data.slice(0, 4).map((d) => (
									<Link
										key={d.id}
										href={`/emails/${d.id}`}
										className="grid grid-cols-3 items-center py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
									>
										<div className="flex min-w-0 flex-col pr-2">
											<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
												{d.toEmails?.[0] || d.fromEmail || "(No Recipient)"}
											</span>
											<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
												{d.subject || "(No Subject)"}
											</span>
										</div>
										<div className="flex items-center justify-center">
											<span
												className={cn(
													"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
													d.status === "delivered"
														? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
														: d.status === "sent"
															? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
															: "bg-zinc-50 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-400",
												)}
											>
												{d.status}
											</span>
										</div>
										<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
											{new Date(d.createdAt).toLocaleDateString([], {
												month: "short",
												day: "numeric",
											})}
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className="flex h-full flex-col items-center justify-center p-6 text-center">
								<Icon
									name="mail-single"
									className="h-6 w-6 text-text-sub-600 dark:text-white/40"
								/>
								<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
									Send emails without the overhead
								</h4>
								<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
									Send transactional & marketing emails with high
									deliverability.
								</p>
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									asChild
									className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
								>
									<Link href="/emails/send">Send email</Link>
								</Button.Root>
							</div>
						)
					) : hasReceivedMessages ? (
						<div className="divide-y divide-stroke-soft-100/10 dark:divide-white/5">
							{messagesData.slice(0, 4).map((d) => (
								<Link
									key={d.id}
									href={`/agent-inbox/${d.mailboxId}`}
									className="grid grid-cols-3 items-center py-2.5 transition-colors hover:bg-bg-weak-50/50 dark:hover:bg-white/[0.01]"
								>
									<div className="flex min-w-0 flex-col pr-2">
										<span className="truncate font-semibold text-text-strong-950 text-xs dark:text-white">
											{d.fromName || d.fromEmail || "(Unknown)"}
										</span>
										<span className="truncate text-[10px] text-text-sub-600 dark:text-white/40">
											{d.subject || "(No Subject)"}
										</span>
									</div>
									<div className="flex items-center justify-center">
										<span
											className={cn(
												"inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold text-[9px] uppercase tracking-wider",
												d.status === "received"
													? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-green-400"
													: d.status === "spam"
														? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
														: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400",
											)}
										>
											{d.status}
										</span>
									</div>
									<div className="flex shrink-0 items-center justify-end whitespace-nowrap text-[10px] text-text-sub-600 dark:text-white/40">
										{new Date(d.createdAt).toLocaleDateString([], {
											month: "short",
											day: "numeric",
										})}
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="flex h-full flex-col items-center justify-center p-6 text-center">
							<Icon
								name="inbox"
								className="h-6 w-6 text-text-sub-600 dark:text-white/40"
							/>
							<h4 className="mt-4 font-semibold text-[15px] text-text-strong-950 tracking-tight dark:text-white">
								No emails received yet
							</h4>
							<p className="mt-2 max-w-[240px] text-text-sub-600 text-xs leading-relaxed dark:text-white/50">
								Configure your agent inboxes to start receiving incoming emails.
							</p>
							<Button.Root
								variant="neutral"
								mode="stroke"
								size="xsmall"
								asChild
								className="mt-6 gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
							>
								<Link href="/agent-inbox/create">Set up inbox</Link>
							</Button.Root>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
