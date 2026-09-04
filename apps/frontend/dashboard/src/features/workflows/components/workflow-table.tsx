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
import { toast } from "sonner";
import type { Workflow } from "../workflow-types";
import { workflowColumns } from "./columns";
import { getWorkflowTableGridStyle } from "./constants";
import { DeleteWorkflowModal } from "./delete-workflow-modal";
import { WorkflowTableFooter } from "./table-footer";
import {
	type WorkflowActionsHandlers,
	WorkflowDropdown,
	WorkflowRowContextMenu,
} from "./workflow-dropdown";
import { WorkflowEmptyState } from "./workflow-empty-state";
import { WorkflowSelectionActionBar } from "./workflow-selection-action-bar";
import { WorkflowTableSkeleton } from "./workflow-table-skeleton";
import { useWorkflows } from "./workflows-provider";

interface WorkflowTableProps {
	workflows: Workflow[];
	columnVisibility?: VisibilityState;
	isLoading?: boolean;
	isTotalEmpty?: boolean;
	isFilteredEmpty?: boolean;
	onCreate: () => void;
	onClearFilters?: () => void;
}

export const WorkflowTable = ({
	workflows,
	columnVisibility = {},
	isLoading,
	isTotalEmpty,
	isFilteredEmpty,
	onCreate,
	onClearFilters,
}: WorkflowTableProps) => {
	const { createWorkflow, updateWorkflow, setWorkflowStatus } = useWorkflows();
	const [, setDeleteId] = useQueryState("delete");
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const limit = pageSize ?? 10;
	const page = currentPage ?? 1;
	const totalPages = Math.max(1, Math.ceil(workflows.length / limit));

	const paginatedWorkflows = useMemo(() => {
		const start = (page - 1) * limit;
		return workflows.slice(start, start + limit);
	}, [workflows, page, limit]);

	const handleDeleteKey = useCallback(
		(id: string) => {
			void setDeleteId(id);
		},
		[setDeleteId],
	);

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const handleDuplicate = useCallback(
		async (id: string) => {
			const orig = workflows.find((w) => w.id === id);
			if (!orig) return;
			try {
				const created = await createWorkflow({
					name: `${orig.name} (Copy)`,
					description: orig.description ?? undefined,
				});
				if (orig.nodes?.length || orig.edges?.length) {
					await updateWorkflow(created.id, {
						nodes: orig.nodes,
						edges: orig.edges,
					});
				}
				toast.success(`Duplicated "${orig.name}"`);
			} catch {
				toast.error("Failed to duplicate automation");
			}
		},
		[workflows, createWorkflow, updateWorkflow],
	);

	const handleToggleStatus = useCallback(
		async (wf: Workflow) => {
			const nextStatus = wf.status === "active" ? "paused" : "active";
			try {
				await setWorkflowStatus(wf.id, nextStatus);
				toast.success(
					nextStatus === "active"
						? `Activated "${wf.name}"`
						: `Paused "${wf.name}"`,
				);
			} catch {
				toast.error("Failed to update status");
			}
		},
		[setWorkflowStatus],
	);

	const actionsHandlers = useMemo<WorkflowActionsHandlers>(
		() => ({
			onToggleStatus: handleToggleStatus,
			onDuplicate: handleDuplicate,
			onDelete: handleDeleteKey,
			onOpenChange: handleOpenChange,
		}),
		[handleToggleStatus, handleDuplicate, handleDeleteKey, handleOpenChange],
	);

	const table = useReactTable({
		data: paginatedWorkflows,
		columns: workflowColumns,
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
			if (paginatedWorkflows.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (paginatedWorkflows.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("workflows:select-all", handler);
		return () => window.removeEventListener("workflows:select-all", handler);
	}, [paginatedWorkflows.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getWorkflowTableGridStyle(columnVisibility);
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const selectedWorkflows = useMemo(
		() => selectedRows.map((row) => row.original),
		[selectedRows],
	);

	const handleClearSelection = useCallback(() => {
		table.resetRowSelection();
	}, [table]);

	const handleBulkStatus = useCallback(
		async (status: "active" | "paused") => {
			for (const wf of selectedWorkflows) {
				await setWorkflowStatus(wf.id, status);
			}
			toast.success(
				`${status === "active" ? "Activated" : "Paused"} ${selectedWorkflows.length} automation${selectedWorkflows.length === 1 ? "" : "s"}`,
			);
		},
		[selectedWorkflows, setWorkflowStatus],
	);

	const handleBulkDelete = useCallback(() => {
		if (selectedCount === 0) return;
		if (selectedCount === 1) {
			const first = selectedWorkflows[0];
			if (first) void setDeleteId(first.id);
			return;
		}
		void setDeleteId("bulk");
	}, [selectedCount, selectedWorkflows, setDeleteId]);

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
					{/* spacer matches actions column */}
					<div />
				</div>

				<div className="-mt-2.5 divide-y divide-stroke-soft-100 overflow-visible rounded-xl border border-stroke-soft-100 bg-bg-white-0 dark:divide-stroke-soft-100/50 dark:border-stroke-soft-100/40">
					{isLoading && workflows.length === 0 ? (
						<WorkflowTableSkeleton
							rows={4}
							columnVisibility={columnVisibility}
						/>
					) : isTotalEmpty ? (
						<WorkflowEmptyState onCreate={onCreate} />
					) : isFilteredEmpty || rows.length === 0 ? (
						<WorkflowEmptyState
							onCreate={onCreate}
							isFiltered
							onClearFilters={onClearFilters}
						/>
					) : (
						rows.map((row) => {
							const workflow = row.original;
							const isRowActive = activeDropdownId === workflow.id;
							return (
								<WorkflowRowContextMenu
									key={row.id}
									workflow={workflow}
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
											<WorkflowDropdown
												workflow={workflow}
												handlers={actionsHandlers}
											/>
										</div>
									</div>
								</WorkflowRowContextMenu>
							);
						})
					)}

					<WorkflowTableFooter
						total={workflows.length}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>

			<WorkflowSelectionActionBar
				table={table}
				onBulkStatus={handleBulkStatus}
				onDelete={handleBulkDelete}
			/>

			<DeleteWorkflowModal
				workflows={workflows}
				selectedWorkflows={selectedWorkflows}
				onClearSelection={handleClearSelection}
			/>
		</>
	);
};
