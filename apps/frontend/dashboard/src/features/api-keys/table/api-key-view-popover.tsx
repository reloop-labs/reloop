"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Activity, Calendar, Clock, Hash, Tag, User } from "lucide-react";
import type * as React from "react";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	API_KEY_VIEW_COLUMNS,
	type ApiKeyViewColumnId,
} from "../hooks/use-api-key-column-visibility";

const COLUMN_ICONS: Record<ApiKeyViewColumnId, React.ReactNode> = {
	name: <Tag className="size-3.5" />,
	prefix: <Hash className="size-3.5" />,
	lastUsed: <Clock className="size-3.5" />,
	status: <Activity className="size-3.5" />,
	createdBy: <User className="size-3.5" />,
	createdAt: <Calendar className="size-3.5" />,
};

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
				icon: COLUMN_ICONS[column.id],
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as ApiKeyViewColumnId, visible)
			}
		/>
	);
}
