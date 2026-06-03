"use client";

import * as Badge from "@reloop/ui/badge";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as StatusBadge from "@reloop/ui/status-badge";
import * as Table from "@reloop/ui/table";
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

			{mailboxes.length === 0 ? (
				<div className="flex flex-col items-center rounded-lg border border-stroke-soft-100 bg-bg-soft-200/10 px-6 py-12 text-center dark:bg-bg-soft-200/15">
					<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
						<Icon name="inbox" className="h-5 w-5 text-text-sub-600" />
					</div>
					<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
						No agent addresses yet
					</h3>
					<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
						Create a dedicated inbox address for each AI agent so inbound mail
						is easy to find and route.
					</p>
					<div className="flex items-center gap-3">
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
						>
							<Icon name="plus" className="h-4 w-4" />
							Add agent address
						</Button.Root>
					</div>
				</div>
			) : (
				<Table.Root className="mb-16 rounded-lg border border-stroke-soft-100 pb-2!">
					<Table.Header>
						<Table.Row>
							<Table.Head className="h-11 font-medium text-sm first:rounded-none">
								Agent address
							</Table.Head>
							<Table.Head className="h-11 font-medium text-sm">
								Purpose
							</Table.Head>
							<Table.Head className="h-11 font-medium text-sm">
								Messages
							</Table.Head>
							<Table.Head className="h-11 font-medium text-sm">
								Needs approval
							</Table.Head>
							<Table.Head className="h-11 font-medium text-sm">
								Last activity
							</Table.Head>
							<Table.Head className="h-11 font-medium text-sm">
								Status
							</Table.Head>
							<Table.Head className="h-11 w-12 last:rounded-none" />
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{mailboxes.map((mailbox, index) => {
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
								<React.Fragment key={mailbox.id}>
									<Table.Row
										className="cursor-pointer [&>td]:group-hover/row:bg-transparent"
										onClick={() => router.push(`/agent-inbox/${mailbox.id}`)}
									>
										<Table.Cell className="h-10">
											<div className="flex items-center gap-2">
												<Icon
													name="mail-single"
													className="h-4 w-4 shrink-0 text-text-sub-600"
												/>
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<span className="truncate text-label-sm text-text-strong-950">
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
													<span className="truncate text-label-xs text-text-sub-600">
														{mailbox.email}
													</span>
												</div>
											</div>
										</Table.Cell>
										<Table.Cell className="h-10">
											<p className="max-w-[200px] truncate text-label-sm text-text-sub-600">
												{mailbox.description}
											</p>
											<p className="truncate text-label-xs text-text-soft-400">
												{SECURITY_LEVEL_LABELS[mailbox.securityLevel]}
											</p>
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950 tabular-nums">
												{stats.total}
											</span>
											{stats.processing > 0 && (
												<p className="text-label-xs text-text-soft-400">
													{stats.processing} processing
												</p>
											)}
										</Table.Cell>
										<Table.Cell className="h-10">
											{stats.needsApproval > 0 ? (
												<Badge.Root
													size="small"
													variant="lighter"
													color="purple"
												>
													{stats.needsApproval}
												</Badge.Root>
											) : (
												<span className="text-label-sm text-text-soft-400">
													—
												</span>
											)}
										</Table.Cell>
										<Table.Cell className="h-10">
											<span className="text-label-sm text-text-strong-950">
												{stats.lastActivityAt
													? dayjs(stats.lastActivityAt).fromNow()
													: "No messages"}
											</span>
										</Table.Cell>
										<Table.Cell className="h-10">
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
										</Table.Cell>
										<Table.Cell className="h-10">
											<Icon
												name="chevron-right"
												className="h-4 w-4 text-text-sub-600"
											/>
										</Table.Cell>
									</Table.Row>
									{index < mailboxes.length - 1 && (
										<tr aria-hidden="true">
											<td colSpan={999} className="py-1.5">
												<div className="h-px bg-stroke-soft-200" />
											</td>
										</tr>
									)}
								</React.Fragment>
							);
						})}
					</Table.Body>
				</Table.Root>
			)}

			<SetupWebhookModal open={setupOpen} onOpenChange={setSetupOpen} />
			<AddAgentAddressModal open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
};
