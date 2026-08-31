"use client";

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
import type { Campaign } from "../campaign-types";
import { useCampaigns } from "../campaigns-provider";
import {
	type CampaignActionsHandlers,
	CampaignDropdown,
	CampaignRowContextMenu,
} from "./campaign-dropdown";
import { CampaignEmptyState } from "./campaign-empty-state";
import { CampaignSelectionActionBar } from "./campaign-selection-action-bar";
import { CampaignSkeleton } from "./campaign-skeleton";
import { campaignColumns } from "./columns";
import { getCampaignTableGridStyle } from "./constants";
import { DeleteCampaignModal } from "./delete-campaign";
import { CampaignTableFooter } from "./table-footer";

export function CampaignTable({
	campaigns,
	total,
	columnVisibility,
	isLoading,
	loadingRows = 4,
}: {
	campaigns: Campaign[];
	total: number;
	columnVisibility: VisibilityState;
	isLoading?: boolean;
	loadingRows?: number;
}) {
	const { sendCampaign, duplicateCampaign } = useCampaigns();
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

	const actionsHandlers = useMemo<CampaignActionsHandlers>(
		() => ({
			onSend: sendCampaign,
			onDuplicate: async (id) => {
				await duplicateCampaign(id);
			},
			onDelete: handleDelete,
			onOpenChange: handleOpenChange,
		}),
		[sendCampaign, duplicateCampaign, handleDelete, handleOpenChange],
	);

	const table = useReactTable({
		data: campaigns,
		columns: campaignColumns,
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
			if (campaigns.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (campaigns.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("campaigns:select-all", handler);
		return () => window.removeEventListener("campaigns:select-all", handler);
	}, [campaigns.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getCampaignTableGridStyle(columnVisibility);
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const selectedCampaigns = useMemo(
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
					{isLoading && campaigns.length === 0 ? (
						<CampaignSkeleton
							rows={loadingRows}
							columnVisibility={columnVisibility}
						/>
					) : rows.length === 0 ? (
						<CampaignEmptyState />
					) : (
						rows.map((row) => {
							const campaign = row.original;
							const isRowActive = activeDropdownId === campaign.id;
							return (
								<CampaignRowContextMenu
									key={row.id}
									campaign={campaign}
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
											<CampaignDropdown
												campaign={campaign}
												handlers={actionsHandlers}
											/>
										</div>
									</div>
								</CampaignRowContextMenu>
							);
						})
					)}

					<CampaignTableFooter
						total={total}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>
			<CampaignSelectionActionBar table={table} />
			<DeleteCampaignModal
				campaigns={campaigns}
				selectedCampaigns={selectedCampaigns}
				onClearSelection={handleClearSelection}
			/>
		</>
	);
}
