import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import type { Group } from "../../hooks/use-contacts-query";
import { type GroupTableMeta, groupColumns } from "./columns";
import { getGroupTableGridStyle } from "./constants";
import { DeleteGroupConfirmModal } from "./delete-group-confirm-modal";
import { EditGroupRowPanel } from "./edit-group-row-panel";
import { GroupDropdown, GroupRowContextMenu } from "./group-dropdown";
import { GroupSelectionActionBar } from "./group-selection-action-bar";
import { GroupsEmptyState } from "./groups-empty-state";
import { GroupTableFooter } from "./table-footer";
import { GroupTableSkeleton } from "./table-skeleton";

interface GroupTableProps {
	groups: Group[];
	total?: number;
	columnVisibility?: VisibilityState;
	isLoading?: boolean;
	loadingRows?: number;
	onAddGroup?: () => void;
	searchQuery?: string;
	onClearSearch?: () => void;
}

export const GroupTable = ({
	groups,
	total = 0,
	columnVisibility = {},
	isLoading,
	loadingRows = 6,
	onAddGroup,
	searchQuery,
	onClearSearch,
}: GroupTableProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));

	const handleEdit = useCallback((group: Group) => {
		setEditingGroupId((prev) => (prev === group.id ? null : group.id));
	}, []);

	const handleDelete = useCallback(
		(group: Group) => {
			void setDeleteId(group.id);
		},
		[setDeleteId],
	);

	const table = useReactTable({
		data: groups,
		columns: groupColumns,
		state: { columnVisibility, rowSelection },
		onColumnVisibilityChange: () => {},
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
		meta: {
			editingGroupId,
		} satisfies GroupTableMeta,
	});

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (groups.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (groups.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("groups:select-all", handler);
		return () => window.removeEventListener("groups:select-all", handler);
	}, [groups.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getGroupTableGridStyle(columnVisibility);
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const selectedGroups = selectedRows.map((row) => row.original);
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
					{isLoading && groups.length === 0 ? (
						<GroupTableSkeleton
							rows={loadingRows}
							columnVisibility={columnVisibility}
						/>
					) : rows.length === 0 ? (
						<GroupsEmptyState
							onAddGroup={onAddGroup}
							searchQuery={searchQuery}
							onClearSearch={onClearSearch}
						/>
					) : (
						rows.map((row) => {
							const group = row.original;
							const isEditing = editingGroupId === group.id;
							const isRowActive = activeDropdownId === group.id || isEditing;

							return (
								<div key={row.id}>
									<GroupRowContextMenu
										group={group}
										onEdit={handleEdit}
										onDelete={handleDelete}
										onOpenChange={(open) =>
											setActiveDropdownId(open ? group.id : null)
										}
									>
										<div
											style={gridStyle}
											data-state={row.getIsSelected() ? "selected" : undefined}
											className={cn(
												"group/row grid w-full items-center px-4 py-2 text-left",
												"hover:bg-bg-weak-50",
												(isRowActive || row.getIsSelected()) &&
													"bg-bg-weak-50/50",
												isEditing && "bg-bg-weak-50/70",
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
												<GroupDropdown
													group={group}
													onEdit={handleEdit}
													onDelete={handleDelete}
													onOpenChange={(open) =>
														setActiveDropdownId(open ? group.id : null)
													}
												/>
											</div>
										</div>
									</GroupRowContextMenu>

									<AnimatePresence initial={false}>
										{isEditing ? (
											<motion.div
												key={`edit-${group.id}`}
												initial={{ height: 0, opacity: 0 }}
												animate={{ height: "auto", opacity: 1 }}
												exit={{ height: 0, opacity: 0 }}
												transition={{
													height: {
														duration: 0.28,
														ease: [0.32, 0.72, 0, 1],
													},
													opacity: { duration: 0.2, ease: "easeOut" },
												}}
												className="overflow-hidden"
											>
												<EditGroupRowPanel
													group={group}
													onClose={() => setEditingGroupId(null)}
												/>
											</motion.div>
										) : null}
									</AnimatePresence>
								</div>
							);
						})
					)}

					<GroupTableFooter
						total={total}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>
			<GroupSelectionActionBar table={table} />
			<DeleteGroupConfirmModal
				groups={groups}
				selectedGroups={selectedGroups}
				onClearSelection={handleClearSelection}
			/>
		</>
	);
};
