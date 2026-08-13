import * as Avatar from "@reloop/ui/avatar";
import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import * as ContextMenu from "@reloop/ui/context-menu";
import * as Dropdown from "@reloop/ui/dropdown";
import { Icon } from "@reloop/ui/icon";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "sonner";
import {
	ActionBar,
	ActionBarClose,
	ActionBarGroup,
	ActionBarItem,
	ActionBarSelection,
	ActionBarSeparator,
} from "#/components/data-table/action-bar";
import { DataTableCheckbox } from "#/components/data-table/data-table-checkbox";
import { PageSizeDropdown } from "#/features/api-keys/table/page-size-dropdown";
import { PaginationControls } from "#/features/api-keys/table/pagination-controls";
import { TableFooter } from "#/features/api-keys/table/table-footer";
import { AnimatedHoverBackground } from "#/features/onboarding/animated-hover-background";
import { getAvatarGradient, getAvatarInitial } from "#/utils/avatar";
import { formatRelativeTime } from "#/utils/format-relative-time";
import { EmailsEmptyState } from "./emails-empty-state";

export interface EmailLogData {
	id: string;
	subject: string;
	fromEmail: string;
	toEmails: string[];
	status: string;
	createdAt: string;
}

interface EmailTableProps {
	logs: EmailLogData[];
	isLoading?: boolean;
	loadingRows?: number;
	currentPage: number;
	pageSize: number;
	totalLogs: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
	hasFilters?: boolean;
	onClearFilters?: () => void;
	variant?: "sent" | "received";
}

const emailGridStyle = {
	gridTemplateColumns: "32px minmax(0, 1.2fr) minmax(0, 1.8fr) 120px 110px 32px",
};

const getEmailStatusColorClass = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "text-success-base";
		case "failed":
		case "bounced":
		case "spam":
			return "text-error-base";
		case "pending":
			return "text-warning-base";
		case "opened":
			return "text-information-base";
		case "clicked":
			return "text-feature-base";
		default:
			return "text-text-sub-600";
	}
};

const getEmailStatusIcon = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
		case "sent":
			return "check-circle";
		case "failed":
		case "bounced":
		case "spam":
			return "minus-circle";
		case "pending":
			return "clock";
		case "opened":
			return "eye-outline";
		case "clicked":
			return "cursor-click";
		default:
			return "mail-single";
	}
};

const getEmailStatusLabel = (status: string): string => {
	switch (status.toLowerCase()) {
		case "delivered":
			return "Delivered";
		case "sent":
			return "Sent";
		case "failed":
			return "Failed";
		case "bounced":
			return "Bounced";
		case "spam":
			return "Spam";
		case "pending":
			return "Pending";
		case "opened":
			return "Opened";
		case "clicked":
			return "Clicked";
		default:
			return status;
	}
};

type MenuItemId = "view" | "copy_id" | "copy_recipient" | "copy_subject";

type EmailActionsHandlers = {
	onViewDetails: (log: EmailLogData) => void;
	onOpenChange: (open: boolean, id: string) => void;
};

function useEmailActionsMenu(
	log: EmailLogData,
	handlers: EmailActionsHandlers,
) {
	const [open, setOpen] = useState(false);
	const [contextMenuKey, setContextMenuKey] = useState(0);
	const [hoverIdx, setHoverIdx] = useState<number | undefined>(undefined);
	const [copiedItem, setCopiedItem] = useState<
		"id" | "recipient" | "subject" | null
	>(null);
	const buttonRefs = useRef<HTMLElement[]>([]);
	const keepOpenRef = useRef(false);

	const menuItems = [
		{
			id: "view" as const,
			label: "View details",
			icon: "info-outline" as const,
			isDanger: false,
		},
		{
			id: "copy_id" as const,
			label: "Copy email ID",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "copy_recipient" as const,
			label: "Copy recipient",
			icon: "copy" as const,
			isDanger: false,
		},
		{
			id: "copy_subject" as const,
			label: "Copy subject",
			icon: "file-text" as const,
			isDanger: false,
		},
	];

	const currentTab = buttonRefs.current[hoverIdx ?? -1];
	const currentRect = currentTab?.getBoundingClientRect();
	const isDanger = menuItems[hoverIdx ?? -1]?.isDanger ?? false;

	const handleOpenChange = useCallback(
		(next: boolean) => {
			if (!next && keepOpenRef.current) return;
			setOpen(next);
			if (!next) {
				setHoverIdx(undefined);
			}
			handlers.onOpenChange(next, log.id);
		},
		[log.id, handlers.onOpenChange],
	);

	const dismissMenu = useCallback(() => {
		setContextMenuKey((key) => key + 1);
		handleOpenChange(false);
	}, [handleOpenChange]);

	const copyToClipboard = async (
		text: string,
		item: "id" | "recipient" | "subject",
		successMessage: string,
	) => {
		keepOpenRef.current = true;
		try {
			await navigator.clipboard.writeText(text);
			toast.success(successMessage);
			setCopiedItem(item);
			setTimeout(() => {
				setCopiedItem(null);
				keepOpenRef.current = false;
				dismissMenu();
			}, 900);
		} catch {
			toast.error("Failed to copy to clipboard");
			keepOpenRef.current = false;
			dismissMenu();
		}
	};

	const handleItemClick = async (id: MenuItemId) => {
		if (id === "view") {
			handlers.onViewDetails(log);
			dismissMenu();
		} else if (id === "copy_id") {
			void copyToClipboard(log.id, "id", "Email ID copied to clipboard");
		} else if (id === "copy_recipient") {
			void copyToClipboard(
				log.toEmails.join(", "),
				"recipient",
				"Recipient email copied to clipboard",
			);
		} else if (id === "copy_subject") {
			void copyToClipboard(
				log.subject || "(No Subject)",
				"subject",
				"Email subject copied to clipboard",
			);
		}
	};

	return {
		open,
		contextMenuKey,
		handleOpenChange,
		menuItems,
		hoverIdx,
		setHoverIdx,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		copiedItem,
		log,
		handleItemClick,
	};
}

function MenuItemLabel({
	item,
	copiedItem,
}: {
	item: ReturnType<typeof useEmailActionsMenu>["menuItems"][number];
	copiedItem: "id" | "recipient" | "subject" | null;
}) {
	const isCopyId = item.id === "copy_id";
	const isCopyRecipient = item.id === "copy_recipient";
	const isCopySubject = item.id === "copy_subject";

	const isThisCopied =
		(isCopyId && copiedItem === "id") ||
		(isCopyRecipient && copiedItem === "recipient") ||
		(isCopySubject && copiedItem === "subject");

	if (isCopyId || isCopyRecipient || isCopySubject) {
		return (
			<AnimatePresence mode="popLayout" initial={false}>
				<motion.div
					key={isThisCopied ? "copied" : "idle"}
					transition={{
						type: "spring",
						duration: 0.25,
						bounce: 0,
					}}
					initial={{ opacity: 0, y: -14 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 14 }}
					className="flex items-center gap-2"
				>
					<Icon
						name={isThisCopied ? "check-circle" : item.icon}
						className={cn(
							"h-3.5 w-3.5 shrink-0",
							isThisCopied ? "text-success-base" : "text-text-sub-600",
						)}
					/>
					<span>
						{isThisCopied
							? isCopyId
								? "Copied ID!"
								: isCopyRecipient
									? "Copied recipient!"
									: "Copied subject!"
							: item.label}
					</span>
				</motion.div>
			</AnimatePresence>
		);
	}

	return (
		<>
			<Icon
				name={item.icon}
				className={cn(
					"h-3.5 w-3.5 shrink-0",
					item.isDanger ? "" : "text-text-sub-600",
				)}
			/>
			<span>{item.label}</span>
		</>
	);
}

function EmailActionsMenuItems({
	menu,
	variant = "dropdown",
}: {
	menu: ReturnType<typeof useEmailActionsMenu>;
	variant?: "dropdown" | "context";
}) {
	const {
		menuItems,
		hoverIdx,
		setHoverIdx,
		buttonRefs,
		currentTab,
		currentRect,
		isDanger,
		copiedItem,
		handleItemClick,
	} = menu;

	const itemClassName = (item: (typeof menuItems)[number], idx: number) =>
		cn(
			"relative flex min-h-[28px] w-full cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 font-normal text-xs transition-colors",
			item.isDanger ? "text-error-base" : "text-text-strong-950",
			!currentRect &&
				hoverIdx === idx &&
				(item.isDanger ? "bg-red-alpha-10" : "bg-neutral-alpha-10"),
			variant === "context" &&
				"data-[disabled]:pointer-events-none data-[highlighted]:bg-transparent",
		);

	const keepsMenuOpen = (id: MenuItemId) =>
		id === "copy_id" || id === "copy_recipient" || id === "copy_subject";

	return (
		<div className="relative">
			{menuItems.map((item, idx) => {
				const label = (
					<MenuItemLabel item={item} copiedItem={copiedItem} />
				);

				if (variant === "context") {
					return (
						<ContextMenu.Item
							key={item.id}
							ref={(el) => {
								if (el) buttonRefs.current[idx] = el;
							}}
							onPointerEnter={() => setHoverIdx(idx)}
							onPointerLeave={() => setHoverIdx(undefined)}
							onSelect={(event) => {
								if (keepsMenuOpen(item.id)) {
									event.preventDefault();
								}
								void handleItemClick(item.id);
							}}
							className={itemClassName(item, idx)}
						>
							{label}
						</ContextMenu.Item>
					);
				}

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
						className={itemClassName(item, idx)}
					>
						{label}
					</button>
				);
			})}
			<AnimatedHoverBackground
				rect={currentRect}
				tabElement={currentTab}
				isDanger={isDanger}
			/>
		</div>
	);
}

const menuContentClassName = "w-48 gap-0 rounded-xl p-1.5";

function EmailActionsMenu({
	log,
	handlers,
}: {
	log: EmailLogData;
	handlers: EmailActionsHandlers;
}) {
	const menu = useEmailActionsMenu(log, handlers);

	return (
		<div
			className="flex items-center justify-end"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => e.stopPropagation()}
		>
			<Dropdown.Root open={menu.open} onOpenChange={menu.handleOpenChange}>
				<Dropdown.Trigger asChild>
					<Button.Root
						type="button"
						variant="neutral"
						mode="ghost"
						size="xxsmall"
						className="aspect-square h-7 w-7 rounded-lg p-0"
						aria-label={`Actions for email ${log.subject || log.id}`}
					>
						<Icon
							name="more-horizontal"
							className="h-3.5 w-3.5 text-text-sub-600"
						/>
					</Button.Root>
				</Dropdown.Trigger>
				<Dropdown.Content
					align="end"
					sideOffset={6}
					className={menuContentClassName}
					onCloseAutoFocus={(e) => e.preventDefault()}
				>
					<EmailActionsMenuItems menu={menu} />
				</Dropdown.Content>
			</Dropdown.Root>
		</div>
	);
}

function EmailRowContextMenu({
	log,
	handlers,
	children,
}: {
	log: EmailLogData;
	handlers: EmailActionsHandlers;
	children: ReactNode;
}) {
	const menu = useEmailActionsMenu(log, handlers);

	return (
		<ContextMenu.Root
			key={menu.contextMenuKey}
			onOpenChange={menu.handleOpenChange}
		>
			<ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
			<ContextMenu.Content
				className={menuContentClassName}
				onCloseAutoFocus={(e) => e.preventDefault()}
			>
				<EmailActionsMenuItems menu={menu} variant="context" />
			</ContextMenu.Content>
		</ContextMenu.Root>
	);
}

function EmailSelectionActionBar({
	logs,
	selectedRowIds,
	onClearSelection,
}: {
	logs: EmailLogData[];
	selectedRowIds: Record<string, boolean>;
	onClearSelection: () => void;
}) {
	const selectedLogs = useMemo(
		() => logs.filter((l) => selectedRowIds[l.id]),
		[logs, selectedRowIds],
	);
	const selectedCount = selectedLogs.length;

	const handleCopyIds = async () => {
		const ids = selectedLogs.map((l) => l.id).join("\n");
		await navigator.clipboard.writeText(ids);
		toast.success(`Copied ${selectedCount} email ID${selectedCount === 1 ? "" : "s"}`);
	};

	const handleCopyRecipients = async () => {
		const recipients = Array.from(
			new Set(selectedLogs.flatMap((l) => l.toEmails)),
		).join("\n");
		await navigator.clipboard.writeText(recipients);
		toast.success(`Copied recipients for ${selectedCount} email${selectedCount === 1 ? "" : "s"}`);
	};

	return (
		<ActionBar
			open={selectedCount > 0}
			onOpenChange={(open) => {
				if (!open) onClearSelection();
			}}
		>
			<ActionBarSelection>
				<span className="font-semibold text-text-strong-950 tabular-nums">
					{selectedCount}
				</span>
				<span className="text-text-sub-600">selected</span>
				<ActionBarSeparator />
				<ActionBarClose onClick={onClearSelection} />
			</ActionBarSelection>

			<ActionBarSeparator />

			<ActionBarGroup>
				<ActionBarItem onClick={() => void handleCopyIds()}>
					<Icon name="copy" className="size-3.5" />
					Copy IDs
				</ActionBarItem>
				<ActionBarItem onClick={() => void handleCopyRecipients()}>
					<Icon name="user" className="size-3.5" />
					Copy Recipients
				</ActionBarItem>
			</ActionBarGroup>
		</ActionBar>
	);
}

const emailColumns: ColumnDef<EmailLogData>[] = [
	{
		id: "select",
		size: 32,
		enableSorting: false,
		enableHiding: false,
		header: ({ table }) => (
			<div
				className="flex items-center"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DataTableCheckbox
					aria-label="Select all"
					checked={
						table.getIsAllPageRowsSelected() ||
						(table.getIsSomePageRowsSelected() && "indeterminate")
					}
					onCheckedChange={(value) =>
						table.toggleAllPageRowsSelected(value === true)
					}
				/>
			</div>
		),
		cell: ({ row }) => (
			<div
				className="flex items-center"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DataTableCheckbox
					aria-label="Select row"
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onCheckedChange={(value) => row.toggleSelected(value === true)}
				/>
			</div>
		),
	},
	{
		id: "to",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="user" className="h-3 w-3" />
				<span className="text-xs">To</span>
			</div>
		),
		cell: ({ row }) => {
			const recipient = row.original.toEmails[0] || "";
			return (
				<div className="flex min-w-0 items-center gap-2 pr-4">
					<Avatar.Root size="20" color="gray" className="shrink-0">
						<Avatar.Image asChild>
							<div
								className={cn(
									"flex h-full w-full items-center justify-center rounded-full font-semibold text-white text-xs uppercase tracking-wide shadow-sm",
									getAvatarGradient(recipient),
								)}
							>
								{getAvatarInitial(null, recipient)}
							</div>
						</Avatar.Image>
					</Avatar.Root>
					<span className="truncate font-medium text-label-sm text-text-strong-950">
						{row.original.toEmails.join(", ")}
					</span>
				</div>
			);
		},
	},
	{
		id: "subject",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="file-text" className="h-3 w-3" />
				<span className="text-xs">Subject</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="min-w-0 truncate pr-4">
				<Link
					href={`/emails/${row.original.id}`}
					className="truncate font-medium text-label-sm text-text-strong-950 underline decoration-dotted underline-offset-2 transition-colors hover:text-[#1868DF] dark:hover:text-blue-400"
				>
					{row.original.subject || "(No Subject)"}
				</Link>
			</div>
		),
	},
	{
		id: "status",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="check-circle" className="h-3 w-3" />
				<span className="text-xs">Status</span>
			</div>
		),
		cell: ({ row }) => {
			const status = row.original.status;
			return (
				<div className="flex items-center">
					<div
						className={cn(
							"flex items-center gap-2 rounded-lg py-0.5 font-medium text-[13px] capitalize",
							getEmailStatusColorClass(status),
						)}
					>
						<Icon
							name={getEmailStatusIcon(status)}
							className="h-3.5 w-3.5"
						/>
						{getEmailStatusLabel(status)}
					</div>
				</div>
			);
		},
	},
	{
		id: "createdAt",
		header: () => (
			<div className="flex items-center gap-1">
				<Icon name="clock" className="h-3 w-3" />
				<span className="text-xs">Time</span>
			</div>
		),
		cell: ({ row }) => (
			<div className="flex items-center">
				<span className="whitespace-nowrap font-medium text-[13px] text-text-sub-600">
					{formatRelativeTime(row.original.createdAt)}
				</span>
			</div>
		),
	},
];

const EmailSkeleton = () => (
	<div style={emailGridStyle} className="grid items-center px-4 py-2">
		<div className="flex items-center">
			<div className="h-4 w-4 rounded border border-stroke-soft-200 bg-bg-weak-50" />
		</div>
		<div className="flex items-center gap-3">
			<div className="h-5 w-5 rounded-full bg-bg-weak-50" />
			<div className="h-4 w-36 rounded bg-bg-weak-50" />
		</div>
		<div className="flex items-center">
			<div className="h-4 w-48 rounded bg-bg-weak-50" />
		</div>
		<div className="flex items-center gap-2">
			<div className="h-3.5 w-3.5 rounded-full bg-bg-weak-50" />
			<div className="h-4 w-16 rounded bg-bg-weak-50" />
		</div>
		<div className="flex items-center">
			<div className="h-4 w-20 rounded bg-bg-weak-50" />
		</div>
		<div className="flex items-center justify-end">
			<div className="h-4 w-4 rounded bg-bg-weak-50" />
		</div>
	</div>
);

export const EmailTable = ({
	logs,
	isLoading,
	loadingRows = 5,
	currentPage,
	pageSize,
	totalLogs,
	onPageChange,
	onPageSizeChange,
	hasFilters = false,
	onClearFilters,
	variant = "sent",
}: EmailTableProps) => {
	const router = useRouter();
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const totalPages = Math.ceil(totalLogs / pageSize) || 1;

	const handleRowClick = useCallback(
		(log: EmailLogData) => {
			router.push(`/emails/${log.id}`);
		},
		[router],
	);

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const actionsHandlers = useMemo<EmailActionsHandlers>(
		() => ({
			onViewDetails: (log) => router.push(`/emails/${log.id}`),
			onOpenChange: handleOpenChange,
		}),
		[router, handleOpenChange],
	);

	const table = useReactTable({
		data: logs,
		columns: emailColumns,
		state: { rowSelection },
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
	});

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (logs.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (logs.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("emails:select-all", handler);
		return () => window.removeEventListener("emails:select-all", handler);
	}, [logs.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;

	const handleClearSelection = useCallback(() => {
		table.resetRowSelection();
	}, [table]);

	return (
		<>
			<div className="w-full text-paragraph-sm">
				{/* Table Header */}
				<div
					style={emailGridStyle}
					className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40"
				>
					{headerGroup?.headers.map((header) => (
						<div key={header.id} className="flex items-center gap-1">
							{header.isPlaceholder
								? null
								: flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
						</div>
					))}
					<div />
				</div>

				{/* Table Body */}
				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading && logs.length === 0 ? (
						Array.from({ length: loadingRows }).map((_, index) => (
							<EmailSkeleton key={`skeleton-${index}`} />
						))
					) : rows.length === 0 ? (
						<EmailsEmptyState
							isFiltered={hasFilters}
							onClearFilters={onClearFilters}
							variant={variant}
						/>
					) : (
						rows.map((row) => {
							const log = row.original;
							const isRowActive = activeDropdownId === log.id;
							return (
								<div key={row.id}>
									<EmailRowContextMenu log={log} handlers={actionsHandlers}>
										<div
											style={emailGridStyle}
											data-state={row.getIsSelected() ? "selected" : undefined}
											className={cn(
												"group/row grid w-full items-center px-4 py-2 text-left transition-colors cursor-pointer",
												"hover:bg-bg-weak-50",
												(isRowActive || row.getIsSelected()) &&
													"bg-bg-weak-50/50",
											)}
											onClick={() => handleRowClick(log)}
										>
											{row.getVisibleCells().map((cell) => (
												<div key={cell.id}>
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext(),
													)}
												</div>
											))}
											<div
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<EmailActionsMenu
													log={log}
													handlers={actionsHandlers}
												/>
											</div>
										</div>
									</EmailRowContextMenu>
								</div>
							);
						})
					)}

					<TableFooter
						total={totalLogs}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>
			<EmailSelectionActionBar
				logs={logs}
				selectedRowIds={rowSelection}
				onClearSelection={handleClearSelection}
			/>
		</>
	);
};
