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
					className={cn(
						"group/row grid w-full items-center px-4 py-2 text-left",
						"hover:bg-bg-weak-50 dark:hover:bg-white/[0.04]",
						(isRowActive || row.getIsSelected()) &&
							"bg-bg-weak-50/50 dark:bg-white/[0.06]",
					)}
				>
					{row.getVisibleCells().map((cell) => (
						<div key={cell.id} className="min-w-0">
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
				<div key={column.id} className="min-w-0">
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
			{/* Phones and tablets: the card (border drawn here) holds a sideways
			    scroller for the columns, and the footer below it stays put */}
			<div className="w-full text-paragraph-sm max-md:overflow-hidden max-md:rounded-[14px] max-md:border max-md:border-stroke-soft-100 dark:max-md:border-stroke-soft-100/70">
				<div className="w-full overflow-x-auto">
					{/* 700px = the column minimums, so the ⋯ column never spills out */}
					<div className="min-w-[700px]">
						<div
							style={gridStyle}
							className="grid items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs max-md:rounded-none max-md:border-0 max-md:pb-2.5 dark:border-[#101010] dark:bg-bg-weak-50/40"
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

							{/* Desktop: footer inside the rows card, as before */}
							<div className="max-md:hidden">
								<DomainTableFooter
									total={total}
									selectedCount={selectedCount}
									pageRowCount={rows.length}
									isLoading={isLoading}
								/>
							</div>
						</div>
					</div>
				</div>
				{/* Phones/tablets: outside the scroller, so it never scrolls sideways. No top
			    border: divide-y already draws one under the last row (the hidden desktop
			    footer above is still the last child). */}
				<div className="bg-bg-white-0 md:hidden dark:bg-black">
					<DomainTableFooter
						total={total}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
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
