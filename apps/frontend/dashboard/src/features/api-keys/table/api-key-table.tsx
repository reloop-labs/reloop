import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	type RowSelectionState,
	useReactTable,
	type VisibilityState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";

import type { ApiKeysListParams } from "../hooks/use-api-keys-query";
import { useToggleApiKey } from "../hooks/use-toggle-api-key";
import { DeleteApiKeyModal } from "../modals/delete-api-key-modal";
import { RotateApiKeyModal } from "../modals/rotate-api-key-modal";
import type { ApiKeyData } from "../types";
import {
	type ApiKeyActionsHandlers,
	ApiKeyActionsMenu,
	ApiKeyRowContextMenu,
} from "./api-key-actions-menu";
import { ApiKeySelectionActionBar } from "./api-key-selection-action-bar";
import { type ApiKeyTableMeta, apiKeyColumns } from "./columns";
import { getApiKeyTableGridStyle } from "./constants";
import { EditApiKeyRowPanel } from "./edit-api-key-row-panel";
import { EmptyState } from "./empty-state";
import { TableFooter } from "./table-footer";
import { TableSkeleton } from "./table-skeleton";

export function ApiKeyTable({
	apiKeys,
	total,
	listParams,
	columnVisibility,
	isLoading,
	loadingRows = 3,
	onDeleteSuccess,
	onRotateSuccess,
	onEditSuccess,
}: {
	apiKeys: ApiKeyData[];
	total: number;
	listParams: ApiKeysListParams;
	columnVisibility: VisibilityState;
	isLoading?: boolean;
	loadingRows?: number;
	onDeleteSuccess?: (deletedName: string) => void;
	onRotateSuccess?: (rotatedName: string) => void;
	onEditSuccess?: (updatedName: string) => void;
}) {
	const router = useRouter();
	const [, setDeleteId] = useQueryState("delete");
	const [, setRotateId] = useQueryState("rotate");
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [editingApiKeyId, setEditingApiKeyId] = useState<string | null>(null);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const { togglingId, toggleEnabled } = useToggleApiKey(listParams);

	const totalPages = Math.max(1, Math.ceil(total / (pageSize ?? 10)));

	const handleRotateKey = useCallback(
		(key: ApiKeyData) => {
			void setRotateId(key.id);
		},
		[setRotateId],
	);

	const handleDeleteKey = useCallback(
		(id: string) => {
			void setDeleteId(id);
		},
		[setDeleteId],
	);

	const handleEditKey = useCallback((id: string) => {
		setEditingApiKeyId((prev) => (prev === id ? null : id));
	}, []);

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const actionsHandlers = useMemo<ApiKeyActionsHandlers>(
		() => ({
			togglingId,
			onToggleEnabled: toggleEnabled,
			onRotateKey: handleRotateKey,
			onDeleteKey: handleDeleteKey,
			onEditKey: handleEditKey,
			onOpenChange: handleOpenChange,
		}),
		[
			togglingId,
			toggleEnabled,
			handleRotateKey,
			handleDeleteKey,
			handleEditKey,
			handleOpenChange,
		],
	);

	const table = useReactTable({
		data: apiKeys,
		columns: apiKeyColumns,
		state: { columnVisibility, rowSelection },
		onColumnVisibilityChange: () => {},
		onRowSelectionChange: setRowSelection,
		enableRowSelection: true,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => row.id,
		manualPagination: true,
		pageCount: totalPages,
		meta: {
			editingApiKeyId,
		} satisfies ApiKeyTableMeta,
	});

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;
	const gridStyle = getApiKeyTableGridStyle(columnVisibility);
	const selectedCount = table.getFilteredSelectedRowModel().rows.length;

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
					{isLoading && apiKeys.length === 0 ? (
						<TableSkeleton
							rows={loadingRows}
							columnVisibility={columnVisibility}
						/>
					) : rows.length === 0 ? (
						<EmptyState
							onCreateApiKey={() => router.push("/api-keys/create")}
						/>
					) : (
						rows.map((row) => {
							const apiKey = row.original;
							const isEditing = editingApiKeyId === apiKey.id;
							const isRowActive = activeDropdownId === apiKey.id || isEditing;
							return (
								<div key={row.id}>
									<ApiKeyRowContextMenu
										apiKey={apiKey}
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
											{/* Actions outside column defs so open state never remounts with columns */}
											<div
												onClick={(e) => e.stopPropagation()}
												onKeyDown={(e) => e.stopPropagation()}
											>
												<ApiKeyActionsMenu
													apiKey={apiKey}
													handlers={actionsHandlers}
												/>
											</div>
										</div>
									</ApiKeyRowContextMenu>

									<AnimatePresence initial={false}>
										{isEditing ? (
											<motion.div
												key={`edit-${apiKey.id}`}
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
												<EditApiKeyRowPanel
													apiKey={apiKey}
													onClose={() => setEditingApiKeyId(null)}
													onSuccess={onEditSuccess}
												/>
											</motion.div>
										) : null}
									</AnimatePresence>
								</div>
							);
						})
					)}

					<TableFooter
						total={total}
						selectedCount={selectedCount}
						pageRowCount={rows.length}
						isLoading={isLoading}
					/>
				</div>
			</div>
			<ApiKeySelectionActionBar table={table} />
			<DeleteApiKeyModal apiKeys={apiKeys} onDeleteSuccess={onDeleteSuccess} />
			<RotateApiKeyModal apiKeys={apiKeys} onRotateSuccess={onRotateSuccess} />
		</>
	);
}
