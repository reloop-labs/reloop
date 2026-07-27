import { cn } from "@reloop/ui/cn";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "#/lib/navigation";
import type { ApiKeysListParams } from "../hooks/use-api-keys-query";
import { useToggleApiKey } from "../hooks/use-toggle-api-key";
import { DeleteApiKeyModal } from "../modals/delete-api-key-modal";
import { RotateApiKeyModal } from "../modals/rotate-api-key-modal";
import type { ApiKeyData } from "../types";
import {
	type ApiKeyActionsHandlers,
	ApiKeyActionsMenu,
} from "./api-key-actions-menu";
import { type ApiKeyTableMeta, apiKeyColumns } from "./columns";
import { API_KEY_TABLE_GRID } from "./constants";
import { EditApiKeyRowPanel } from "./edit-api-key-row-panel";
import { EmptyState } from "./empty-state";
import { TableFooter } from "./table-footer";
import { TableSkeleton } from "./table-skeleton";

export function ApiKeyTable({
	apiKeys,
	total,
	listParams,
	isLoading,
	loadingRows = 3,
	onDeleteSuccess,
	onRotateSuccess,
	onEditSuccess,
}: {
	apiKeys: ApiKeyData[];
	total: number;
	listParams: ApiKeysListParams;
	isLoading?: boolean;
	loadingRows?: number;
	onDeleteSuccess?: (deletedName: string) => void;
	onRotateSuccess?: (rotatedName: string) => void;
	onEditSuccess?: (updatedName: string) => void;
}) {
	const navigate = useNavigate();
	const [, setDeleteId] = useQueryState("delete");
	const [, setRotateId] = useQueryState("rotate");
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
	const [editingApiKeyId, setEditingApiKeyId] = useState<string | null>(null);

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

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					className={`grid ${API_KEY_TABLE_GRID} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 text-xs dark:border-[#101010] dark:bg-bg-weak-50/40`}
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
						<TableSkeleton rows={loadingRows} />
					) : rows.length === 0 ? (
						<EmptyState
							onCreateApiKey={() =>
								void navigate({ to: "/api-keys/create" })
							}
						/>
					) : (
						rows.map((row) => {
							const apiKey = row.original;
							const isEditing = editingApiKeyId === apiKey.id;
							const isRowActive =
								activeDropdownId === apiKey.id || isEditing;
							return (
								<div key={row.id}>
									<div
										className={cn(
											`group/row grid w-full ${API_KEY_TABLE_GRID} items-center px-4 py-2 text-left transition-colors`,
											isRowActive && "bg-bg-weak-50/50",
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

					<TableFooter total={total} isLoading={isLoading} />
				</div>
			</div>
			<DeleteApiKeyModal apiKeys={apiKeys} onDeleteSuccess={onDeleteSuccess} />
			<RotateApiKeyModal apiKeys={apiKeys} onRotateSuccess={onRotateSuccess} />
		</>
	);
}
