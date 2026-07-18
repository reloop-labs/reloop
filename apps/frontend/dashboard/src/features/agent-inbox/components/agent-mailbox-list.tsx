import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { Skeleton } from "@reloop/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { formatRelativeTime } from "#/utils/format-relative-time";
import type { AgentMailbox } from "../types";
import { AddAgentAddressModal } from "./add-agent-address-modal";
import { useAgentInbox } from "./agent-inbox-provider";
import { AgentInboxEmptyState } from "./empty-state";

const TABLE_GRID =
	"grid grid-cols-[minmax(0,1fr)_120px_140px_32px] items-center px-4";

const DOCS_URL = "https://docs.reloop.sh/integrations/agent-email-inbox";

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
	isDeleting,
	onOpenChange,
}: {
	mailbox: AgentMailbox;
	onToggleEnabled: (mailbox: AgentMailbox) => void;
	onDelete: (id: string) => void;
	isToggling: boolean;
	isDeleting: boolean;
	onOpenChange?: (open: boolean) => void;
}) {
	const navigate = useNavigate();
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
			void navigate({
				to: "/inbox/$mailboxId",
				params: { mailboxId: mailbox.id },
			});
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
							const busy =
								(item.id === "toggle" && isToggling) ||
								(item.id === "delete" && isDeleting);
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
										<Icon
											name="loader-2"
											className={cn(
												"h-3.5 w-3.5 animate-spin",
												item.isDanger ? "text-error-base" : "text-text-sub-600",
											)}
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

// ── Status filter ────────────────────────────────────────────────────────────

const statusFilterOptions: {
	id: StatusFilter;
	label: string;
}[] = [
	{ id: null, label: "All Status" },
	{ id: "active", label: "Active" },
	{ id: "disabled", label: "Disabled" },
];

function MailboxStatusFilterDropdown({
	value,
	onChange,
}: {
	value: StatusFilter;
	onChange: (value: StatusFilter) => void;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const buttonRefs = useRef<HTMLButtonElement[]>([]);

	const selectedIdx = statusFilterOptions.findIndex((o) => o.id === value);
	const activeIdx = hoverIdx !== undefined ? hoverIdx : selectedIdx;
	const currentTab = buttonRefs.current[activeIdx];
	const currentRect = currentTab?.getBoundingClientRect();

	const selectedOption = value
		? statusFilterOptions.find((o) => o.id === value)
		: null;
	const displayLabel = selectedOption ? selectedOption.label : "All Status";
	const displayIcon = selectedOption?.id
		? getStatusIcon(selectedOption.id)
		: "activity";

	return (
		<Dropdown.Root open={isOpen} onOpenChange={setIsOpen}>
			<Dropdown.Trigger asChild>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					className="w-40 justify-between gap-1.5 whitespace-nowrap rounded-[10px]"
				>
					<div className="flex items-center gap-1.5 overflow-hidden">
						<Icon
							name={displayIcon}
							className={cn(
								"h-3.5 w-3.5 shrink-0",
								selectedOption?.id
									? getStatusColorClass(selectedOption.id)
									: "",
							)}
						/>
						<span className="truncate">{displayLabel}</span>
					</div>
					<Icon name="chevron-down" className="h-3.5 w-3.5 shrink-0" />
				</Button.Root>
			</Dropdown.Trigger>
			<Dropdown.Content align="start" className="w-40 p-2">
				<div className="relative">
					{statusFilterOptions.map((option, idx) => {
						const isChecked = value === option.id;
						return (
							<button
								key={option.id ?? "all"}
								ref={(el) => {
									if (el) buttonRefs.current[idx] = el;
								}}
								type="button"
								onPointerEnter={() => setHoverIdx(idx)}
								onPointerLeave={() => setHoverIdx(undefined)}
								onClick={() => {
									onChange(option.id);
									setIsOpen(false);
								}}
								className={cn(
									"flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 font-normal text-xs text-text-strong-950",
									isChecked && "bg-neutral-alpha-10",
								)}
							>
								<div className="flex items-center gap-2">
									{option.id ? (
										<Icon
											name={getStatusIcon(option.id)}
											className={cn(
												"h-3.5 w-3.5",
												getStatusColorClass(option.id),
											)}
										/>
									) : (
										<Icon name="activity" className="h-3.5 w-3.5" />
									)}
									<span className={cn(isChecked && "font-medium")}>
										{option.label}
									</span>
								</div>
								{isChecked && <Icon name="check" className="h-3.5 w-3.5" />}
							</button>
						);
					})}
					<AnimatedHoverBackground rect={currentRect} tabElement={currentTab} />
				</div>
			</Dropdown.Content>
		</Dropdown.Root>
	);
}

// ── Header + toolbar ─────────────────────────────────────────────────────────

function AgentMailboxListHeader({ onAdd }: { onAdd: () => void }) {
	const openDocs = () => window.open(DOCS_URL, "_blank");

	useHotkeys("d", openDocs);
	useHotkeys("mod+a", (e) => {
		e.preventDefault();
		onAdd();
	});

	return (
		<div className="flex items-center justify-between pt-10 pb-6">
			<h1 className="flex items-center justify-center gap-1 font-medium text-2xl">
				Agent Inbox
			</h1>
			<div className="flex items-center gap-2">
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="xsmall"
					onClick={openDocs}
					className="gap-1.5"
				>
					<Icon name="file-text" className="h-4 w-4" />
					Docs
					<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-200 p-px font-medium text-[10px] uppercase">
						D
					</span>
				</Button.Root>
				<Button.Root
					variant="neutral"
					size="xsmall"
					onClick={onAdd}
					className="gap-1.5"
				>
					<Icon name="plus" className="h-4 w-4" />
					Add agent address
					<span className="inline-flex items-center gap-0.5">
						<Icon
							name="command"
							className="h-4 w-4 rounded-sm border border-stroke-soft-100/20 p-px"
						/>
						<span className="flex h-4 w-4 items-center justify-center rounded-sm border border-stroke-soft-100/20 p-px font-medium text-[10px] uppercase">
							A
						</span>
					</span>
				</Button.Root>
			</div>
		</div>
	);
}

function AgentMailboxListToolbar() {
	const [statusFilter, setStatusFilter] = useQueryState(
		"status",
		parseAsStringLiteral(["active", "disabled"] as const),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="xsmall" className="rounded-[10px]">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="xsmall" />
						<Input.Input
							placeholder="Search agent addresses..."
							value={searchQuery}
							onChange={(e) => {
								void setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<MailboxStatusFilterDropdown
				value={statusFilter}
				onChange={(filters) => {
					void setStatusFilter(filters);
					void setCurrentPage(1);
				}}
			/>
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
	let description = "No agent addresses match your current filters.";

	if (searchQuery.trim() !== "" && statusFilter !== null) {
		title = "No matching addresses";
		description = `No ${statusLabel.toLowerCase()} addresses matching "${searchQuery}" were found.`;
	} else if (searchQuery.trim() !== "") {
		title = `No addresses found for "${searchQuery}"`;
		description =
			"We couldn't find any agent addresses matching your search. Try checking for typos.";
	} else if (statusFilter !== null) {
		title = `No ${statusLabel.toLowerCase()} addresses`;
		description = `We couldn't find any addresses with the status "${statusLabel}".`;
	}

	return (
		<div className="flex flex-col items-center px-6 py-12 text-center dark:bg-bg-weak-50/30">
			<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:border-stroke-soft-100/50">
				<Icon name="search" className="h-5 w-5 text-text-sub-600" />
			</div>
			<h3 className="mb-2 font-semibold text-text-strong-950 text-xl">
				{title}
			</h3>
			<p className="mx-auto mb-6 max-w-[300px] text-balance font-medium text-[12px] text-text-sub-600">
				{description}
			</p>
			<Button.Root
				variant="neutral"
				mode="stroke"
				size="xsmall"
				onClick={onClear}
				className="gap-2 rounded-lg"
			>
				<Icon name="refresh-cw" className="h-3.5 w-3.5" />
				Clear filters
			</Button.Root>
		</div>
	);
}

// ── Main list ────────────────────────────────────────────────────────────────

export const AgentMailboxList = () => {
	const navigate = useNavigate();
	const { mailboxes, refresh, isLoadingMailboxes } = useAgentInbox();
	const [modal, setModal] = useQueryState("modal");
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
	const [deletingId, setDeletingId] = useState<string | null>(null);
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
			await axios.patch(`/api/inbox/v1/mailboxes/${mailbox.id}`, {
				status: newStatus,
			});
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
		} catch {
			toast.error("Failed to delete inbox address");
		} finally {
			setDeletingId(null);
		}
	};

	const goToMailbox = (id: string) => {
		void navigate({ to: "/inbox/$mailboxId", params: { mailboxId: id } });
	};

	const clearFilters = () => {
		void setStatusFilter(null);
		void setSearchQuery("");
		void setCurrentPage(1);
	};

	return (
		<div className="mx-auto max-w-3xl space-y-8 p-6 lg:p-8">
			<AgentMailboxListHeader onAdd={() => setAddOpen(true)} />

			<div className="space-y-4">
				<AgentMailboxListToolbar />

				<div className="w-full text-paragraph-sm">
					{/* Table header — matches domain list */}
					<div
						className={cn(
							TABLE_GRID,
							"rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-white/[0.03]",
						)}
					>
						<div className="flex items-center gap-1">
							<Icon name="inbox" className="h-3 w-3" />
							<span className="text-xs">Agent Address</span>
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
										role="link"
										tabIndex={0}
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
		</div>
	);
};
