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
import type { Property } from "../../hooks/use-contacts-query";
import { type PropertyTableMeta, propertyColumns } from "./columns";
import { getPropertyTableGridStyle } from "./constants";
import { DeletePropertyConfirmModal } from "./delete-property-confirm-modal";
import { EditPropertyRowPanel } from "./edit-property-row-panel";
import { PropertiesEmptyState } from "./properties-empty-state";
import {
	PropertyActionsMenu,
	PropertyRowContextMenu,
} from "./property-actions-menu";
import { PropertySelectionActionBar } from "./property-selection-action-bar";
import { PropertyTableFooter } from "./table-footer";
import { PropertyTableSkeleton } from "./table-skeleton";

interface PropertyTableProps {
	properties: Property[];
	total?: number;
	columnVisibility?: VisibilityState;
	isLoading?: boolean;
	loadingRows?: number;
	onAddProperty?: () => void;
	searchQuery?: string;
	typeFilter?: string[];
	onClearFilters?: () => void;
}

export const PropertyTable = ({
	properties,
	total = 0,
	columnVisibility = {},
	isLoading,
	loadingRows = 4,
	onAddProperty,
	searchQuery,
	typeFilter,
	onClearFilters,
}: PropertyTableProps) => {
	const [, setDeleteId] = useQueryState("delete");
	const [pageSize] = useQueryState(
		"propertyLimit",
		parseAsInteger.withDefault(10),
	);
	const [openPropertyId, setOpenPropertyId] = useState<string | null>(null);
	const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
		null,
	);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));

	const handleEdit = useCallback((property: Property) => {
		setEditingPropertyId((prev) => (prev === property.id ? null : property.id));
	}, []);

	const handleDelete = useCallback(
		(property: Property) => {
			void setDeleteId(property.id);
		},
		[setDeleteId],
	);

	const table = useReactTable({
		data: properties,
		columns: propertyColumns,
		state: { columnVisibility, rowSelection },
		onColumnVisibilityChange: () => {},
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
		meta: {
			editingPropertyId,
			onEditProperty: handleEdit,
		} satisfies PropertyTableMeta,
	});

	useHotkeys(
		"mod+a",
		(e) => {
			e.preventDefault();
			if (properties.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		},
		{ enableOnFormTags: false, preventDefault: true },
	);

	useEffect(() => {
		const handler = () => {
			if (properties.length === 0) return;
			const allSelected = table.getIsAllPageRowsSelected();
			table.toggleAllPageRowsSelected(!allSelected);
		};
		window.addEventListener("properties:select-all", handler);
		return () => window.removeEventListener("properties:select-all", handler);
	}, [properties.length, table]);

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getPropertyTableGridStyle(columnVisibility);
	const selectedRows = table.getFilteredSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const selectedProperties = selectedRows.map((row) => row.original);
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
					{isLoading && properties.length === 0 ? (
						<PropertyTableSkeleton
							rows={loadingRows}
							columnVisibility={columnVisibility}
						/>
					) : rows.length === 0 ? (
						<PropertiesEmptyState
							onAddProperty={onAddProperty}
							searchQuery={searchQuery}
							typeFilter={typeFilter}
							onClearFilters={onClearFilters}
						/>
					) : (
						rows.map((row) => {
							const property = row.original;
							const isEditing = editingPropertyId === property.id;
							const isRowActive = openPropertyId === property.id || isEditing;

							return (
								<div key={row.id}>
									<PropertyRowContextMenu
										property={property}
										onEdit={handleEdit}
										onDelete={handleDelete}
										onOpenChange={(open) =>
											setOpenPropertyId(open ? property.id : null)
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
												<PropertyActionsMenu
													property={property}
													onEdit={handleEdit}
													onDelete={handleDelete}
													onOpenChange={(open) =>
														setOpenPropertyId(open ? property.id : null)
													}
												/>
											</div>
										</div>
									</PropertyRowContextMenu>

									<AnimatePresence initial={false}>
										{isEditing ? (
											<motion.div
												key={`edit-${property.id}`}
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
												<EditPropertyRowPanel
													property={property}
													onClose={() => setEditingPropertyId(null)}
												/>
											</motion.div>
										) : null}
									</AnimatePresence>
								</div>
							);
						})
					)}

					<PropertyTableFooter
						total={total}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>
			<PropertySelectionActionBar table={table} />
			<DeletePropertyConfirmModal
				properties={properties}
				selectedProperties={selectedProperties}
				onClearSelection={handleClearSelection}
			/>
		</>
	);
};
