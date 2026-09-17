"use client";

import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import type { Campaign } from "../campaign-types";
import { useCampaigns } from "../campaigns-provider";
import {
	type CampaignActionsHandlers,
	CampaignDropdown,
	CampaignRowContextMenu,
} from "./campaign-dropdown";
import { CampaignEmptyState } from "./campaign-empty-state";
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
		state: { columnVisibility },
		onColumnVisibilityChange: () => {},
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
	});

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getCampaignTableGridStyle(columnVisibility);

	const showEmptyState = !isLoading && rows.length === 0;
	const showHeader = !showEmptyState;

	return (
		<>
			<div className="w-full text-paragraph-sm">
				{showHeader ? (
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
				) : null}

				<div
					className={cn(
						"divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40",
						showHeader && "-mt-2.5",
					)}
				>
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
										className={cn(
											"group/row grid w-full items-center px-4 py-2 text-left",
											"hover:bg-bg-weak-50",
											isRowActive && "bg-bg-weak-50/50",
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

					<CampaignTableFooter total={total} isLoading={isLoading} />
				</div>
			</div>
			<DeleteCampaignModal campaigns={campaigns} />
		</>
	);
}
