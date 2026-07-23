import { cn } from "@reloop/ui/cn";
import { useNavigate } from "@tanstack/react-router";
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { parseAsInteger, useQueryState } from "nuqs";
import { useCallback, useMemo, useState } from "react";
import type { ApiKeysListParams } from "../hooks/use-api-keys-query";
import { useToggleApiKey } from "../hooks/use-toggle-api-key";
import { DeleteApiKeyModal } from "../modals/delete-api-key-modal";
import { EditApiKeyModal } from "../modals/edit-api-key-modal";
import { RotateApiKeyModal } from "../modals/rotate-api-key-modal";
import type { ApiKeyData } from "../types";
import {
	type ApiKeyActionsHandlers,
	ApiKeyActionsMenu,
} from "./api-key-actions-menu";
import { apiKeyColumns } from "./columns";
import { API_KEY_TABLE_GRID } from "./constants";
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
}: {
	apiKeys: ApiKeyData[];
	total: number;
	listParams: ApiKeysListParams;
	isLoading?: boolean;
	loadingRows?: number;
	onDeleteSuccess?: (deletedName: string) => void;
}) {
	const navigate = useNavigate();
	const [, setDeleteId] = useQueryState("delete");
	const [, setRotateId] = useQueryState("rotate");
	const [, setModal] = useQueryState("modal");
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));
	const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

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

	const handleOpenChange = useCallback((open: boolean, id: string) => {
		setActiveDropdownId(open ? id : null);
	}, []);

	const actionsHandlers = useMemo<ApiKeyActionsHandlers>(
		() => ({
			togglingId,
			onToggleEnabled: toggleEnabled,
			onRotateKey: handleRotateKey,
			onDeleteKey: handleDeleteKey,
			onOpenChange: handleOpenChange,
		}),
		[
			togglingId,
			toggleEnabled,
			handleRotateKey,
			handleDeleteKey,
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
	});

	const headerGroup = table.getHeaderGroups()[0];
	const rows = table.getRowModel().rows;

	return (
		<>
			<div className="w-full text-paragraph-sm">
				<div
					className={`grid ${API_KEY_TABLE_GRID} items-center rounded-t-[14px] border-stroke-soft-100 border-t border-r border-l bg-bg-weak-50/50 px-4 pt-2.5 pb-5 font-medium text-text-sub-600 dark:border-[#101010] dark:bg-bg-weak-50/40`}
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
							onCreateApiKey={() => void setModal("create-api-key")}
						/>
					) : (
						rows.map((row) => {
							const apiKey = row.original;
							const isRowActive = activeDropdownId === apiKey.id;
							return (
								<div
									key={row.id}
									className={cn(
										`group/row grid w-full ${API_KEY_TABLE_GRID} items-center px-4 py-2 text-left transition-colors`,
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
							);
						})
					)}

					<TableFooter total={total} isLoading={isLoading} />
				</div>
			</div>
			<DeleteApiKeyModal apiKeys={apiKeys} onDeleteSuccess={onDeleteSuccess} />
			<RotateApiKeyModal apiKeys={apiKeys} />
			<EditApiKeyModal apiKeys={apiKeys} />
		</>
	);
}
