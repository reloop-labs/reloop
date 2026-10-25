import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	type Row,
	type RowSelectionState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Domain } from "../types";
import { type DomainTableMeta, domainColumns } from "./columns";
import { getDomainTableGridStyle } from "./constants";
import { DeleteDomainModal } from "./delete-domain";
import {
	type DomainActionsHandlers,
	DomainDropdown,
	DomainRowContextMenu,
} from "./domain-dropdown";
import { DomainFavicon } from "./domain-favicon";
import { groupByRootDomain, groupLabelOf } from "./domain-groups";
import { DomainSelectionActionBar } from "./domain-selection-action-bar";
import { DomainSkeleton } from "./domain-skeleton";
import { EmptyState } from "./empty-state";
import { DomainTableFooter } from "./table-footer";

// Phones/tablets (< md): the table scrolls sideways inside its card while the
// checkbox and Domain columns stay frozen, so you always see which row you're on.
const STICKY_SELECT =
	"max-md:sticky max-md:left-0 max-md:z-10 max-md:-ml-4 max-md:pl-4";
const STICKY_DOMAIN =
	"max-md:sticky max-md:left-12 max-md:z-10 max-md:pr-2 max-md:after:absolute max-md:after:inset-y-0 max-md:after:right-0 max-md:after:w-px max-md:after:bg-stroke-soft-100 dark:max-md:after:bg-stroke-soft-100/70";
// Frozen cells are opaque and fill the row's height; a ::before layer repeats
// the row's hover / selected / menu-open tint so the row reads as one.
const STICKY_ROW_FILL =
	"max-md:-my-2 max-md:flex max-md:items-center max-md:self-stretch max-md:py-2 max-md:bg-bg-white-0 dark:max-md:bg-black max-md:before:absolute max-md:before:inset-0 max-md:before:-z-10 max-md:group-hover/row:before:bg-bg-weak-50 dark:max-md:group-hover/row:before:bg-white/[0.04] max-md:group-data-[state=selected]/row:before:bg-bg-weak-50/50 dark:max-md:group-data-[state=selected]/row:before:bg-white/[0.06] max-md:group-data-[active=true]/row:before:bg-bg-weak-50/50 dark:max-md:group-data-[active=true]/row:before:bg-white/[0.06]";
const STICKY_HEADER_FILL =
	"max-md:-my-2.5 max-md:self-stretch max-md:py-2.5 max-md:bg-bg-white-0 dark:max-md:bg-black max-md:before:absolute max-md:before:inset-0 max-md:before:-z-10 max-md:before:bg-bg-weak-50/50 dark:max-md:before:bg-bg-weak-50/40";

function stickyCell(columnId: string, fill: string): string | undefined {
	if (columnId === "select") return cn(STICKY_SELECT, fill);
	if (columnId === "domain") return cn(STICKY_DOMAIN, fill);
	return undefined;
}

export function DomainTable({
	domains,
	total,
	columnVisibility,
	isLoading,
	loadingRows = 4,
}: {
	domains: Domain[];
	total: number;
	columnVisibility: VisibilityState;
	isLoading?: boolean;
	loadingRows?: number;
}) {
	const [, setDeleteId] = useQueryState("delete");
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));

	const handleDelete = useCallback(
		(id: string) => {
			void setDeleteId(id);
		},
		[setDeleteId],
	);

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const actionsHandlers = useMemo<DomainActionsHandlers>(
		() => ({
			onDelete: handleDelete,
			onOpenChange: handleOpenChange,
		}),
		[handleDelete, handleOpenChange],
	);

	const groupRootById = useMemo(() => {
		const map = new Map<string, string>();
		for (const group of groupByRootDomain(domains, (d) => d.domain)) {
			if (group.kind !== "group") continue;
			for (const child of group.children) map.set(child.id, group.root);
		}
		return map;
	}, [domains]);

	const table = useReactTable({
		data: domains,
		columns: domainColumns,
		state: { columnVisibility, rowSelection },
		onColumnVisibilityChange: () => {},
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
		meta: { groupRootById } satisfies DomainTableMeta,
	});

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (domains.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (domains.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("domains:select-all", handler);
		return () => window.removeEventListener("domains:select-all", handler);
	}, [domains.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getDomainTableGridStyle(columnVisibility);
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const selectedDomains = useMemo(
		() => selectedRows.map((row) => row.original),
		[selectedRows],
	);
	const handleClearSelection = useCallback(() => {
		table.resetRowSelection();
	}, [table]);

	// Subdomains are grouped under their root domain (acme.com → mail.acme.com).
	const groups = useMemo(
		() => groupByRootDomain(rows, (row) => row.original.domain),
		[rows],
	);
	const visibleColumns = table.getVisibleLeafColumns();

	const renderRow = (
		row: Row<Domain>,
		tree: TreeSlotProps = { kind: "none" },
	) => {
		const domain = row.original;
		const isRowActive = activeDropdownId === domain.id;
		return (
			<DomainRowContextMenu
				key={row.id}
				domain={domain}
				handlers={actionsHandlers}
			>
				<div
					style={gridStyle}
					data-state={row.getIsSelected() ? "selected" : undefined}
					data-active={isRowActive ? "true" : undefined}
					className={cn(
						"group/row grid w-full items-center px-4 py-2 text-left",
						"hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]",
						(isRowActive || row.getIsSelected()) &&
							"bg-bg-weak-50/50 dark:bg-white/[0.06]",
					)}
				>
					{row.getVisibleCells().map((cell) => (
						<div
							key={cell.id}
							className={cn(
								"min-w-0",
								stickyCell(cell.column.id, STICKY_ROW_FILL),
							)}
						>
							{cell.column.id === "domain" && tree.kind === "child" ? (
								<div className="flex min-w-0 items-center gap-1">
									<TreeSlot />
									<div className="min-w-0">
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</div>
								</div>
							) : (
								flexRender(cell.column.columnDef.cell, cell.getContext())
							)}
						</div>
					))}
					<div
						onClick={(e) => e.stopPropagation()}
						onKeyDown={(e) => e.stopPropagation()}
					>
						<DomainDropdown domain={domain} handlers={actionsHandlers} />
					</div>
				</div>
			</DomainRowContextMenu>
		);
	};

	/** Header row for a group whose root domain was not added itself: icon + name only. */
	const renderGroupHeader = (root: string) => (
		<div
			key={`group:${root}`}
			style={gridStyle}
			className="grid w-full items-center px-4 py-2 text-left"
		>
			{visibleColumns.map((column) => (
				<div
					key={column.id}
					className={cn("min-w-0", stickyCell(column.id, STICKY_ROW_FILL))}
				>
					{column.id === "domain" ? (
						<div className="flex min-w-0 items-center gap-1" title={root}>
							<DomainFavicon domain={root} className="text-text-sub-600" />
							<span className="truncate font-semibold text-label-sm text-text-strong-950 dark:text-white">
								{groupLabelOf(root)}
							</span>
						</div>
					) : null}
				</div>
			))}
			<div />
		</div>
	);

	const renderChildren = (children: Row<Domain>[]) =>
		children.map((row) => renderRow(row, { kind: "child" }));

	return (
		<>
			{/* Phones and tablets scroll the table sideways inside its card (which
			    draws the border there) instead of crushing the columns */}
			<div className="w-full overflow-x-auto text-paragraph-sm max-md:rounded-[14px] max-md:border max-md:border-stroke-soft-100 dark:max-md:border-stroke-soft-100/70">
				{/* 700px = the column minimums, so the ⋯ column never spills out */}
				<div className="min-w-[700px]">
					<div
						style={gridStyle}
						className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs max-md:rounded-none max-md:border-0 max-md:pb-2.5 dark:border-[#101010] dark:bg-bg-weak-50/40"
					>
						{headerGroup?.headers.map((header) => (
							<div
								key={header.id}
								className={cn(
									"flex items-center gap-1",
									stickyCell(header.column.id, STICKY_HEADER_FILL),
								)}
							>
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

					<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 max-md:mt-0 max-md:rounded-none max-md:border-0 max-md:border-t dark:divide-stroke-soft-100 dark:border-stroke-soft-100/70 dark:bg-black [&>*:first-child]:rounded-t-[11px] max-md:[&>*:first-child]:rounded-none">
						{isLoading && domains.length === 0 ? (
							<DomainSkeleton
								rows={loadingRows}
								columnVisibility={columnVisibility}
							/>
						) : rows.length === 0 ? (
							<EmptyState />
						) : (
							groups.map((group) =>
								group.kind === "single" ? (
									renderRow(group.item)
								) : (
									<Fragment key={`group:${group.root}`}>
										{group.parent
											? renderRow(group.parent)
											: renderGroupHeader(group.root)}
										{renderChildren(group.children)}
									</Fragment>
								),
							)
						)}

						<DomainTableFooter
							total={total}
							selectedCount={selectedCount}
							pageRowCount={rows.length}
							isLoading={isLoading}
						/>
					</div>
				</div>
			</div>
			<DomainSelectionActionBar table={table} />
			<DeleteDomainModal
				domains={domains}
				selectedDomains={selectedDomains}
				onClearSelection={handleClearSelection}
			/>
		</>
	);
}

type TreeSlotProps = { kind: "none" } | { kind: "child" };

/**
 * Indent for a grouped child's domain cell. The guide line runs through the
 * centre of the group's 12px icon above (6px in).
 */
function TreeSlot() {
	return (
		<span aria-hidden className="relative w-5 shrink-0 self-stretch">
			<span className="-inset-y-2 -translate-x-1/2 absolute left-1.5 w-px bg-stroke-soft-200 dark:bg-stroke-soft-100/60" />
		</span>
	);
}
