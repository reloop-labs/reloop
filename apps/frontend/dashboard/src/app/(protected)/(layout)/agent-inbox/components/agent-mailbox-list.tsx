"use client";

import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AddAgentAddressModal } from "./add-agent-address-modal";
import { useAgentInbox } from "./agent-inbox-provider";
import { SetupWebhookModal } from "./setup-webhook-modal";

dayjs.extend(relativeTime);

const gridClass = "grid grid-cols-[1fr_120px_32px] items-center px-4";

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
						<Icon name="inbox" className="h-3 w-3" />
						<span className="text-xs">Agent Inbox</span>
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
										"group/row cursor-pointer py-4 text-left transition-all duration-200",
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
									)}
								>
									{/* Agent & Info */}
									<div className="flex min-w-0 items-start gap-2 pr-4">
										<Icon
											name="inbox"
											className="mt-0.5 h-5 w-5 text-text-sub-600 transition-transform group-hover/row:scale-105"
										/>
										<div className="min-w-0 flex-1">
											<div className="flex items-center gap-2">
												<span className="max-w-[160px] truncate font-semibold text-label-sm text-text-strong-950 sm:max-w-none">
													{mailbox.label}
												</span>
												{stats.unread > 0 && (
													<span className="shrink-0 rounded-full bg-[#0A438A] px-1.5 py-0.5 font-semibold text-[10px] text-white uppercase dark:bg-[#1E57A8]">
														{stats.unread} new
													</span>
												)}
											</div>
											<div className="mt-0.5 truncate font-mono text-label-xs text-text-sub-600">
												{mailbox.email}
											</div>
											<div className="mt-1 truncate text-label-xs text-text-soft-400 dark:text-text-soft-400/80">
												{mailbox.description}
											</div>
										</div>
									</div>

									{/* Status */}
									<div className="flex items-center">
										<div
											className={cn(
												"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
												mailbox.status === "active"
													? "text-success-base"
													: "text-error-base",
											)}
										>
											<Icon
												name={
													mailbox.status === "active"
														? "check-circle"
														: "cross-circle"
												}
												className="h-3.5 w-3.5"
											/>
											{mailbox.status === "active" ? "Active" : "Disabled"}
										</div>
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
