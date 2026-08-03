"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Calendar, Clock, Tag, Users } from "lucide-react";
import type * as React from "react";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	GROUP_VIEW_COLUMNS,
	type GroupViewColumnId,
} from "../../hooks/use-group-column-visibility";

const COLUMN_ICONS: Record<GroupViewColumnId, React.ReactNode> = {
	name: <Tag className="size-3.5" />,
	contacts: <Users className="size-3.5" />,
	updatedAt: <Clock className="size-3.5" />,
	createdAt: <Calendar className="size-3.5" />,
};

export function GroupViewPopover({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: GroupViewColumnId, visible: boolean) => void;
}) {
	return (
		<DataTableViewOptions
			align="end"
			columns={GROUP_VIEW_COLUMNS.map((column) => ({
				id: column.id,
				label: column.label,
				locked: column.id === "name",
				icon: COLUMN_ICONS[column.id],
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as GroupViewColumnId, visible)
			}
		/>
	);
}
