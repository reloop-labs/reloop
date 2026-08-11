import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import { Skeleton } from "@reloop/ui/skeleton";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { AgentMailboxListToolbar } from "../list/agent-mailbox-list-toolbar";
import { DeleteAgentMailboxModal } from "../modals/delete-agent-mailbox-modal";
import type { AgentMailbox } from "../types";
import { AddAgentAddressModal } from "./add-agent-address-modal";
import { useAgentInbox } from "./agent-inbox-provider";
import { AgentInboxEmptyState } from "./shared/empty-state";
import { LoadingDot } from "./shared/loading-dot";

const TABLE_GRID =
	"grid grid-cols-[minmax(0,1fr)_120px_140px_32px] items-center px-4";

type MailboxStatus = AgentMailbox["status"];
type StatusFilter = MailboxStatus | null;

const getStatusLabel = (status: MailboxStatus): string =>
	status === "active" ? "Active" : "Disabled";

const getStatusColorClass = (status: MailboxStatus): string =>
	status === "active" ? "text-success-base" : "text-error-base";

const getStatusIcon = (status: MailboxStatus): string =>
	status === "active" ? "check-circle" : "cross-circle";

// ── Row actions ──────────────────────────────────────────────────────────────

function AgentMailboxActionsDropdown({
	mailbox,
	onToggleEnabled,
	onDelete,
	isToggling,
	onOpenChange,
}: {
	mailbox: AgentMailbox;
	onToggleEnabled: (mailbox: AgentMailbox) => void;
	onDelete: (id: string) => void;
	isToggling: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const toggleIcon =
		mailbox.status === "active" ? ("pause" as const) : ("play" as const);
	const menuItems = [
		{
			id: "view" as const,
			label: "View Inbox",
			icon: "inbox" as const,
			isDanger: false,
		},
		{
			id: "copy" as const,
			label: "Copy Email",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "toggle" as const,
			label: mailbox.status === "active" ? "Disable" : "Enable",
			icon: toggleIcon,
			isDanger: false,
		},
		{
			id: "delete" as const,
			label: "Delete Address",
			icon: "trash" as const,
			isDanger: true,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = (next: boolean) => {
		setOpen(next);
		if (!next) setHoverIdx(undefined);
		onOpenChange?.(next);
	};

	const handleItemClick = (itemId: (typeof menuItems)[number]["id"]) => {
		if (itemId === "toggle") {
			onToggleEnabled(mailbox);
		} else if (itemId === "delete") {
			onDelete(mailbox.id);
		} else if (itemId === "view") {
			router.push(`/inbox/${mailbox.id}`);
		} else if (itemId === "copy") {
			void navigator.clipboard.writeText(mailbox.email);
			toast.success("Email copied to clipboard");
		}
		handleOpenChange(false);
	};

	return (
		<div
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={open} onOpenChange={handleOpenChange}>
				<Dropdown.Trigger asChild>
					<Button.Root
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="rounded p-1"
					>
						<Icon
							name="more-horizontal"
							className="h-3 w-3 text-text-sub-600 hover:text-text-strong-950"
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className="w-40 gap-0 rounded-xl p-1.5"
				>
					<div className="relative">
						{menuItems.map((item, idx) => {
							const busy = item.id === "toggle" && isToggling;
							return (
								<button
									key={item.id}
									ref={(el) => {
										if (el) buttonRefs.current[idx] = el;
									}}
									type="button"
									onPointerEnter={() => setHoverIdx(idx)}
									onPointerLeave={() => setHoverIdx(undefined)}
									onClick={() => handleItemClick(item.id)}
									disabled={busy}
									className={cn(
										"flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 font-normal text-xs",
										item.isDanger ? "text-error-base" : "text-text-strong-950",
										!currentRect &&
											hoverIdx === idx &&
											(item.isDanger
												? "bg-red-alpha-10"
												: "bg-neutral-alpha-10"),
										busy && "cursor-not-allowed opacity-50",
									)}
								>
									{busy ? (
										<span className="text-text-sub-600">
											<LoadingDot label="Working" style={{ fontSize: 12 }} />
										</span>
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
							);
						})}
						<AnimatedHoverBackground
							rect={currentRect}
							tabElement={currentTab}
							isDanger={isDanger}
						/>
					</div>
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function AgentMailboxSkeleton() {
	return (
		<div className={cn(TABLE_GRID, "py-2")}>
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-4 rounded" />
				<Skeleton className="h-4 w-48 rounded" />
			</div>
			<div className="flex items-center gap-2">
				<Skeleton className="h-4 w-16 rounded" />
			</div>
			<div className="flex items-center">
				<Skeleton className="h-4 w-20 rounded" />
			</div>
			<div className="flex items-center justify-center">
				<Skeleton className="h-4 w-4 rounded" />
			</div>
		</div>
	);
}

// ── Filtered empty (inside table card) ───────────────────────────────────────

function FilteredEmptyState({
	searchQuery,
	statusFilter,
	onClear,
}: {
	searchQuery: string;
	statusFilter: StatusFilter;
	onClear: () => void;
}) {
	const statusLabel = statusFilter ? getStatusLabel(statusFilter) : "";
	let title = "No matching addresses";
	let description = "No addresses match your current filters.";

	if (searchQuery.trim() !== "" && statusFilter !== null) {
		title = "No matching addresses";
		description = `No ${statusLabel.toLowerCase()} addresses matching "${searchQuery}" were found.`;
	} else if (searchQuery.trim() !== "") {
		title = `No addresses found for "${searchQuery}"`;
		description =
			"We couldn't find any addresses matching your search. Try checking for typos.";
	} else if (statusFilter !== null) {
		title = `No ${statusLabel.toLowerCase()} addresses`;
		description = `We couldn't find any addresses with the status "${statusLabel}".`;
	}

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-4 flex items-center justify-center">
				<Icon name="search" className="h-8 w-8 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title}
			</h3>
			<p className="mx-auto mb-6 max-w-75 text-balance font-medium text-[12px] text-text-sub-600">
				{description}
			</p>
			<Button.Root
				type="button"
				variant="neutral"
				mode="stroke"
				size="small"
				onClick={onClear}
				className="gap-1.5 rounded-xl"
			>
				<Icon name="cross-circle" className="h-4 w-4 text-text-sub-600" />
				Clear filters
			</Button.Root>
		</div>
	);
}

// ── Main list ────────────────────────────────────────────────────────────────

export const AgentMailboxList = () => {
	const router = useRouter();
	const { mailboxes, refresh, isLoadingMailboxes } = useAgentInbox();
	const [modal, setModal] = useQueryState("modal");
	const [, setDeleteId] = useQueryState("delete");
	const addOpen = modal === "create-agent-mailbox";
	const setAddOpen = (open: boolean) => {
		void setModal(open ? "create-agent-mailbox" : null);
	};

	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsStringLiteral(["active", "disabled"] as const),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const [togglingId, setTogglingId] = useState<string | null>(null);
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

	const filteredMailboxes = useMemo(() => {
		const q = (searchQuery ?? "").trim().toLowerCase();
		return mailboxes.filter((mailbox) => {
			if (statusFilter && mailbox.status !== statusFilter) return false;
			if (!q) return true;
			return (
				mailbox.email.toLowerCase().includes(q) ||
				mailbox.label.toLowerCase().includes(q)
			);
		});
	}, [mailboxes, searchQuery, statusFilter]);

	const total = filteredMailboxes.length;
	const size = pageSize ?? 10;
	const page = currentPage ?? 1;
	const totalPages = Math.max(1, Math.ceil(total / size));
	const safePage = Math.min(page, totalPages);
	const startIndex = total === 0 ? 0 : (safePage - 1) * size + 1;
	const endIndex = Math.min(safePage * size, total);
	const pagedMailboxes = filteredMailboxes.slice(
		(safePage - 1) * size,
		safePage * size,
	);

	const isFiltered = statusFilter !== null || (searchQuery ?? "").trim() !== "";

	const handleToggleEnabled = async (mailbox: AgentMailbox) => {
		const newStatus = mailbox.status === "active" ? "disabled" : "active";
		try {
			setTogglingId(mailbox.id);
			await axios.patch(
				`/api/inbox/v1/mailboxes/${mailbox.id}`,
				{ status: newStatus },
				{ withCredentials: true },
			);
			toast.success(
				`Inbox address ${newStatus === "active" ? "enabled" : "disabled"} successfully`,
			);
			await refresh();
		} catch {
			toast.error("Failed to update inbox status");
		} finally {
			setTogglingId(null);
		}
	};

	const openDeleteMailbox = (id: string) => {
		void setDeleteId(id);
	};

	const goToMailbox = (id: string) => {
		router.push(`/inbox/${id}`);
	};

	const clearFilters = () => {
		void setStatusFilter(null);
		void setSearchQuery("");
		void setCurrentPage(1);
	};

	return (
		<div className="pb-8">
			<div className="space-y-4">
				<AgentMailboxListToolbar />

				<div className="w-full text-paragraph-sm">
					{/* Table header */}
					<div
						className={cn(
							TABLE_GRID,
							"rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-white/[0.03]",
						)}
					>
						<div className="flex items-center gap-1">
							<Icon name="inbox" className="h-3 w-3" />
							<span className="text-xs">Address</span>
						</div>
						<div className="flex items-center gap-1">
							<Icon name="activity" className="h-3 w-3" />
							<span className="text-xs">Status</span>
						</div>
						<div className="flex items-center gap-1">
							<Icon name="clock" className="h-3 w-3" />
							<span className="text-xs">Created At</span>
						</div>
						<div />
					</div>

					{/* Table body */}
					<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-hidden rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
						{isLoadingMailboxes ? (
							Array.from({ length: 4 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeleton
								<AgentMailboxSkeleton key={`skeleton-${i}`} />
							))
						) : mailboxes.length === 0 ? (
							<AgentInboxEmptyState onAddClick={() => setAddOpen(true)} />
						) : filteredMailboxes.length === 0 ? (
							<FilteredEmptyState
								searchQuery={searchQuery ?? ""}
								statusFilter={statusFilter}
								onClear={clearFilters}
							/>
						) : (
							pagedMailboxes.map((mailbox) => {
								const isRowActive = activeDropdownId === mailbox.id;
								return (
									<div
										key={mailbox.id}
										onClick={() => goToMailbox(mailbox.id)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												goToMailbox(mailbox.id);
											}
										}}
										className={cn(
											TABLE_GRID,
											"group/row cursor-pointer py-2 text-left transition-colors",
											"hover:bg-bg-weak-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-base",
											isRowActive && "bg-bg-weak-50/50",
										)}
									>
										{/* Address */}
										<div className="flex min-w-0 items-center gap-2 pr-4">
											<Icon
												name="inbox"
												className={cn(
													"h-4 w-4 shrink-0",
													getStatusColorClass(mailbox.status),
												)}
											/>
											<span className="truncate font-medium text-label-sm text-text-strong-950">
												{mailbox.email}
											</span>
										</div>

										{/* Status */}
										<div className="flex items-center">
											<div
												className={cn(
													"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
													getStatusColorClass(mailbox.status),
												)}
											>
												<Icon
													name={getStatusIcon(mailbox.status)}
													className="h-3.5 w-3.5"
												/>
												{getStatusLabel(mailbox.status)}
											</div>
										</div>

										{/* Created */}
										<div>
											<span className="whitespace-nowrap font-medium text-[13px]">
												{formatRelativeTime(mailbox.createdAt)}
											</span>
										</div>

										{/* Actions */}
										<div className="flex items-center justify-center text-text-soft-400">
											<AgentMailboxActionsDropdown
												mailbox={mailbox}
												onToggleEnabled={handleToggleEnabled}
												onDelete={openDeleteMailbox}
												isToggling={togglingId === mailbox.id}
												onOpenChange={(open) =>
													setActiveDropdownId(open ? mailbox.id : null)
												}
											/>
										</div>
									</div>
								);
							})
						)}

						{total > 0 && (
							<div className="flex items-center justify-between px-4 py-2 text-label-xs text-text-sub-600">
								<div className="flex items-center">
									<span>
										Showing {startIndex}–{endIndex} of {total} address
										{total !== 1 ? "es" : ""}
										{isFiltered ? " (filtered)" : ""}
									</span>
									<PageSizeDropdown
										value={size}
										onValueChange={(value) => {
											void setPageSize(value);
											void setCurrentPage(1);
										}}
									/>
								</div>
								<PaginationControls
									currentPage={safePage}
									totalPages={totalPages}
									onPageChange={(p) => void setCurrentPage(p)}
									isLoading={isLoadingMailboxes}
								/>
							</div>
						)}
					</div>
				</div>
			</div>

			<AddAgentAddressModal
				isOpen={addOpen}
				onClose={() => setAddOpen(false)}
			/>
			<DeleteAgentMailboxModal
				mailboxes={mailboxes}
				onDeleteSuccess={(name) => {
					toast.success(`Address "${name}" has been successfully deleted.`);
					void refresh();
				}}
			/>
		</div>
	);
};
