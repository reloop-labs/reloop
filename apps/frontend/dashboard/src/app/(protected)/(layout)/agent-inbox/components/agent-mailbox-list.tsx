"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as StatusBadge from "@reloop/ui/status-badge";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { SECURITY_LEVEL_LABELS } from "../mock-data";
import { AddAgentAddressModal } from "./add-agent-address-modal";
import { useAgentInbox } from "./agent-inbox-provider";
import { SetupWebhookModal } from "./setup-webhook-modal";

dayjs.extend(relativeTime);

const gridClass =
	"grid grid-cols-[1.4fr_1.6fr_90px_110px_110px_90px_32px] items-center px-4";

export const AgentMailboxList = () => {
	const router = useRouter();
	const { mailboxes, threads } = useAgentInbox();
	const [setupOpen, setSetupOpen] = useState(false);
	const [addOpen, setAddOpen] = useState(false);

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10 pb-6">
				<h1 className="font-medium text-2xl">Agent Inbox</h1>
				<div className="flex items-center gap-2">
					<Button.Root
						variant="neutral"
						mode="stroke"
						size="xsmall"
						onClick={() => setSetupOpen(true)}
					>
						<Icon name="webhook" className="h-4 w-4" />
						Setup webhook
					</Button.Root>
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => setAddOpen(true)}
						className="gap-1.5"
					>
						<Icon name="plus" className="h-4 w-4" />
						Add agent address
					</Button.Root>
				</div>
			</div>

			<div className="w-full text-paragraph-sm">
				{/* Table Header */}
				<div
					className={cn(
						gridClass,
						"rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
					)}
				>
					<div className="flex items-center gap-1">
						<Icon name="mail-single" className="h-3 w-3" />
						<span className="text-xs">Agent address</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="file-text" className="h-3 w-3" />
						<span className="text-xs">Purpose</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="message-square" className="h-3 w-3" />
						<span className="text-xs">Messages</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="alert-circle" className="h-3 w-3" />
						<span className="text-xs">Needs approval</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="clock" className="h-3 w-3" />
						<span className="text-xs">Last activity</span>
					</div>
					<div className="flex items-center gap-1">
						<Icon name="activity" className="h-3 w-3" />
						<span className="text-xs">Status</span>
					</div>
					<div />
				</div>

				{/* Table Body */}
				<div className="-mt-2.5 mb-16 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{mailboxes.length === 0 ? (
						<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
							<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
								<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
							</div>
							<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
								No agent addresses yet
							</h3>
							<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
								Create a dedicated inbox address for each AI agent so inbound
								mail is easy to find and route.
							</p>
							<div className="flex items-center gap-3">
								<Button.Root
									variant="neutral"
									mode="stroke"
									size="xsmall"
									onClick={() => setSetupOpen(true)}
									className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
								>
									<Icon name="webhook" className="h-4 w-4" />
									Setup webhook
								</Button.Root>
								<Button.Root
									variant="neutral"
									size="xsmall"
									onClick={() => setAddOpen(true)}
									className="gap-2 rounded-lg border-stroke-soft-100 text-text-sub-600 hover:text-text-strong-950 dark:border-stroke-soft-100/50"
								>
									<Icon name="plus" className="h-4 w-4" />
									Add agent address
								</Button.Root>
							</div>
						</div>
					) : (
						mailboxes.map((mailbox) => {
							const mThreads = threads.filter(
								(t) => t.mailboxId === mailbox.id,
							);
							const stats = {
								total: mThreads.length,
								unread: mThreads.filter((t) => t.unread).length,
								needsApproval: mThreads.filter(
									(t) => t.status === "needs_approval",
								).length,
								processing: mThreads.filter(
									(t) => t.status === "parsing" || t.status === "new",
								).length,
								lastActivityAt:
									mThreads.length > 0
										? mThreads.reduce(
												(latest, t) =>
													t.receivedAt > latest ? t.receivedAt : latest,
												mThreads[0]!.receivedAt,
											)
										: null,
							};
							return (
								<div
									key={mailbox.id}
									onClick={() => router.push(`/agent-inbox/${mailbox.id}`)}
									className={cn(
										gridClass,
										"group/row cursor-pointer py-3.5 text-left transition-colors",
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
									)}
								>
									{/* Agent address */}
									<div className="flex min-w-0 items-center gap-2.5 pr-4">
										<div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-stroke-soft-100 bg-bg-white-0 shadow-xs dark:border-stroke-soft-100/50">
											<Icon
												name="mail-single"
												className="h-4 w-4 text-text-sub-600"
											/>
										</div>
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span className="truncate font-medium text-label-sm text-text-strong-950">
													{mailbox.label}
												</span>
												{stats.unread > 0 && (
													<Badge.Root
														size="small"
														variant="filled"
														color="blue"
													>
														{stats.unread} new
													</Badge.Root>
												)}
											</div>
											<div className="truncate text-label-xs text-text-sub-600">
												{mailbox.email}
											</div>
										</div>
									</div>

									{/* Purpose */}
									<div className="min-w-0 pr-4">
										<p className="truncate text-label-sm text-text-strong-950">
											{mailbox.description}
										</p>
										<p className="truncate text-label-xs text-text-soft-400">
											{SECURITY_LEVEL_LABELS[mailbox.securityLevel]}
										</p>
									</div>

									{/* Messages */}
									<div>
										<span className="font-medium text-[13px] text-text-strong-950 tabular-nums">
											{stats.total}
										</span>
										{stats.processing > 0 && (
											<p className="text-label-xs text-text-soft-400">
												{stats.processing} processing
											</p>
										)}
									</div>

									{/* Needs approval */}
									<div>
										{stats.needsApproval > 0 ? (
											<Badge.Root size="small" variant="lighter" color="purple">
												{stats.needsApproval}
											</Badge.Root>
										) : (
											<span className="text-[13px] text-text-soft-400">—</span>
										)}
									</div>

									{/* Last activity */}
									<div>
										<span className="whitespace-nowrap font-medium text-[13px] text-text-strong-950">
											{stats.lastActivityAt
												? dayjs(stats.lastActivityAt).fromNow()
												: "No messages"}
										</span>
									</div>

									{/* Status */}
									<div className="flex items-center">
										<StatusBadge.Root
											status={
												mailbox.status === "active" ? "completed" : "disabled"
											}
										>
											<StatusBadge.Icon
												as={Icon}
												name={
													mailbox.status === "active"
														? "checkbox-circle"
														: "slash"
												}
												className="h-3 w-3"
											/>
											{mailbox.status}
										</StatusBadge.Root>
									</div>

									{/* Chevron */}
									<div className="flex items-center justify-center text-text-soft-400">
										<Icon
											name="chevron-right"
											className="h-4 w-4 text-text-sub-600 transition-transform group-hover/row:translate-x-0.5"
										/>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<SetupWebhookModal open={setupOpen} onOpenChange={setSetupOpen} />
			<AddAgentAddressModal open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
};
