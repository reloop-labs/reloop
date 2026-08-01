"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	API_KEY_VIEW_COLUMNS,
	type ApiKeyViewColumnId,
} from "../hooks/use-api-key-column-visibility";

export function ApiKeyViewPopover({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: ApiKeyViewColumnId, visible: boolean) => void;
}) {
	return (
		<DataTableViewOptions
			align="end"
			columns={API_KEY_VIEW_COLUMNS.map((column) => ({
				id: column.id,
				label: column.label,
				locked: column.id === "name",
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as ApiKeyViewColumnId, visible)
			}
		/>
	);
}
