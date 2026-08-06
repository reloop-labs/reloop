import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Domain } from "../types";
import { domainColumns } from "./columns";
import { getDomainTableGridStyle } from "./constants";
import { DeleteDomainModal } from "./delete-domain";
import {
	type DomainActionsHandlers,
	DomainDropdown,
	DomainRowContextMenu,
} from "./domain-dropdown";
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

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					style={gridStyle}
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

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading && domains.length === 0 ? (
						<DomainSkeleton
							rows={loadingRows}
							columnVisibility={columnVisibility}
						/>
					) : rows.length === 0 ? (
						<EmptyState />
					) : (
						rows.map((row) => {
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
											"hover:bg-bg-weak-50",
											(isRowActive || row.getIsSelected()) &&
												"bg-bg-weak-50/50",
										)}
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
											<DomainDropdown
												domain={domain}
												handlers={actionsHandlers}
											/>
										</div>
									</div>
								</DomainRowContextMenu>
							);
						})
					)}

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
