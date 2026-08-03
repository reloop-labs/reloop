"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Calendar, Clock, FileText, Hash, Tag } from "lucide-react";
import type * as React from "react";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	PROPERTY_VIEW_COLUMNS,
	type PropertyViewColumnId,
} from "../../hooks/use-property-column-visibility";

const COLUMN_ICONS: Record<PropertyViewColumnId, React.ReactNode> = {
	name: <Tag className="size-3.5" />,
	type: <Hash className="size-3.5" />,
	default: <FileText className="size-3.5" />,
	updatedAt: <Clock className="size-3.5" />,
	createdAt: <Calendar className="size-3.5" />,
};

export function PropertyViewPopover({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: PropertyViewColumnId, visible: boolean) => void;
}) {
	return (
		<DataTableViewOptions
			align="end"
			columns={PROPERTY_VIEW_COLUMNS.map((column) => ({
				id: column.id,
				label: column.label,
				locked: column.id === "name",
				icon: COLUMN_ICONS[column.id],
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as PropertyViewColumnId, visible)
			}
		/>
	);
}
