"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Activity, Clock, Globe } from "lucide-react";
import type * as React from "react";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	DOMAIN_VIEW_COLUMNS,
	type DomainViewColumnId,
} from "../hooks/use-domain-column-visibility";

const COLUMN_ICONS: Record<DomainViewColumnId, React.ReactNode> = {
	domain: <Globe className="size-3.5" />,
	status: <Activity className="size-3.5" />,
	createdAt: <Clock className="size-3.5" />,
};

export function DomainViewPopover({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: DomainViewColumnId, visible: boolean) => void;
}) {
	return (
		<DataTableViewOptions
			align="end"
			columns={DOMAIN_VIEW_COLUMNS.map((column) => ({
				id: column.id,
				label: column.label,
				locked: column.id === "domain",
				icon: COLUMN_ICONS[column.id],
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as DomainViewColumnId, visible)
			}
		/>
	);
}
