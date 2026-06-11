"use client";

import { AnimatedHoverBackground } from "@fe/dashboard/components/animated-hover-background";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import {
	Content as PopoverContent,
	Root as PopoverRoot,
	Trigger as PopoverTrigger,
} from "@reloop/ui/popover";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { AddAgentAddressModal } from "./add-agent-address-modal";
import { useAgentInbox } from "./agent-inbox-provider";
import { AgentInboxEmptyState } from "./empty-state";

dayjs.extend(relativeTime);

const gridClass = "grid grid-cols-[1fr_120px_32px] items-center px-4";

const AgentMailboxActionsDropdown = ({
	mailbox,
	onToggleEnabled,
	onDelete,
	isToggling,
	isDeleting,
	onOpenChange,
}: {
	mailbox: any;
	onToggleEnabled: (mailbox: any) => void;
	onDelete: (id: string) => void;
	isToggling: boolean;
	isDeleting: boolean;
	onOpenChange?: (open: boolean) => void;
}) => {
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const handlePopoverOpenChange = (open: boolean) => {
		setPopoverOpen(open);
		onOpenChange?.(open);
	};

	const toggleIcon =
		mailbox.status === "active" ? ("pause" as const) : ("play" as const);
	const menuItems = [
		{
			id: "toggle",
			label: mailbox.status === "active" ? "Disable" : "Enable",
			icon: toggleIcon,
			isDanger: false,
		},
		{
			id: "delete",
			label: "Delete Address",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const hoveredItem = menuItems[hoverIdx ?? -1];
	const isDanger = hoveredItem?.isDanger ?? false;

	const handleItemClick = (itemId: string) => {
		if (itemId === "toggle") {
			onToggleEnabled(mailbox);
			setPopoverOpen(false);
		} else if (itemId === "delete") {
			onDelete(mailbox.id);
			setPopoverOpen(false);
		}
	};

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
		>
			<PopoverRoot open={popoverOpen} onOpenChange={handlePopoverOpenChange}>
				<PopoverTrigger asChild>
					<Button.Root variant="neutral" mode="ghost" size="xxsmall">
						<Icon name="more-horizontal" className="h-3 w-3" />
					</Button.Root>
				</PopoverTrigger>
				<PopoverContent
					align="end"
					sideOffset={-10}
					className="w-40 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => (
							<button
								key={item.id}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => handleItemClick(item.id)}
								disabled={
									(item.id === "toggle" && isToggling) ||
									(item.id === "delete" && isDeleting)
								}
								className={cn(
									"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-xs transition-colors",
									item.isDanger ? "text-error-base" : "text-text-strong-950",
									!currentRect &&
										hoverIdx === idx &&
										(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
									((isToggling && item.id === "toggle") ||
										(isDeleting && item.id === "delete")) &&
										"cursor-not-allowed opacity-50",
								)}
							>
								{item.id === "toggle" && isToggling ? (
									<Icon
										name="loader-2"
										className="h-3.5 w-3.5 animate-spin text-text-sub-600"
									/>
								) : item.id === "delete" && isDeleting ? (
									<Icon
										name="loader-2"
										className="h-3.5 w-3.5 animate-spin text-error-base"
									/>
								) : (
									<Icon
										name={item.icon}
										className={cn(
											"h-3.5 w-3.5",
											item.isDanger ? "" : "text-text-sub-600",
										)}
									/>
								)}
								<span>{item.label}</span>
							</button>
						))}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</PopoverContent>
			</PopoverRoot>
		</div>
	);
};

export const AgentMailboxList = () => {
	const router = useRouter();
	const { mailboxes, threads, refresh, isLoadingMailboxes } = useAgentInbox();
	const [addOpen, setAddOpen] = useState(false);

	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const handleToggleEnabled = async (mailbox: any) => {
		const newStatus = mailbox.status === "active" ? "disabled" : "active";
		try {
			setTogglingId(mailbox.id);
			await axios.patch(`/api/inbox/v1/mailboxes/${mailbox.id}`, {
				status: newStatus,
			});
			toast.success(
				`Inbox address ${newStatus === "active" ? "enabled" : "disabled"} successfully`,
			);
			await refresh();
		} catch (_error) {
			toast.error("Failed to update inbox status");
		} finally {
			setTogglingId(null);
		}
	};

	const handleDeleteMailbox = async (id: string) => {
		if (
			!confirm(
				"Are you sure you want to permanently delete this inbox address and all its messages?",
			)
		) {
			return;
		}
		try {
			setDeletingId(id);
			await axios.delete(`/api/inbox/v1/mailboxes/${id}`);
			toast.success("Inbox address deleted successfully");
			await refresh();
		} catch (_error) {
			toast.error("Failed to delete inbox address");
		} finally {
			setDeletingId(null);
		}
	};
	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-6 pb-4">
				<h1 className="font-medium text-2xl">Agent Inbox</h1>
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

			<div className="w-full text-paragraph-sm">
				{/* Table Header */}
				<div
					className={cn(
						gridClass,
						"rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-2.5 pb-2.5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40",
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
				<div className="mb-16 divide-y divide-stroke-soft-100 overflow-hidden rounded-b-xl border-stroke-soft-100 border-r border-b border-l bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoadingMailboxes ? (
						[1, 2, 3].map((i) => (
							<div key={i} className={cn(gridClass, "animate-pulse py-3.5")}>
								<div className="flex items-start gap-2">
									<div className="mt-0.5 h-5 w-5 shrink-0 rounded bg-bg-weak-50/50 dark:bg-white/5" />
									<div className="flex flex-col gap-1.5">
										<Skeleton className="h-4 w-48 rounded" />
										<Skeleton className="h-3 w-32 rounded" />
									</div>
								</div>
								<div className="flex items-center">
									<Skeleton className="h-4 w-16 rounded" />
								</div>
								<div className="flex items-center justify-end">
									<Skeleton className="h-4 w-4 rounded" />
								</div>
							</div>
						))
					) : mailboxes.length === 0 ? (
						<AgentInboxEmptyState onAddClick={() => setAddOpen(true)} />
					) : (
						mailboxes.map((mailbox) => {
							const mThreads = threads.filter(
								(t) => t.mailboxId === mailbox.id,
							);
							const stats = {
								total: mThreads.length,
								spam: mThreads.filter((t) => t.status === "blocked").length,
							};
							const isRowActive = activeDropdownId === mailbox.id;
							return (
								<div
									key={mailbox.id}
									onClick={() => router.push(`/agent-inbox/${mailbox.id}`)}
									className={cn(
										gridClass,
										"group/row cursor-pointer py-2.5 text-left transition-all duration-200",
										"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-base",
										isRowActive && "bg-bg-weak-50/50",
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
												<span className="max-w-[240px] truncate font-semibold text-label-sm text-text-strong-950 sm:max-w-none">
													{mailbox.email}
												</span>
												{stats.spam > 0 && (
													<span className="shrink-0 rounded-full bg-error-base/10 px-1.5 py-0.5 font-semibold text-[8px] text-error-base uppercase dark:bg-error-base/20">
														{stats.spam} spam
													</span>
												)}
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

									{/* Actions */}
									<div className="flex items-center justify-end">
										<AgentMailboxActionsDropdown
											mailbox={mailbox}
											onToggleEnabled={handleToggleEnabled}
											onDelete={handleDeleteMailbox}
											isToggling={togglingId === mailbox.id}
											isDeleting={deletingId === mailbox.id}
											onOpenChange={(open) =>
												setActiveDropdownId(open ? mailbox.id : null)
											}
										/>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>

			<AddAgentAddressModal open={addOpen} onOpenChange={setAddOpen} />
		</div>
	);
};
