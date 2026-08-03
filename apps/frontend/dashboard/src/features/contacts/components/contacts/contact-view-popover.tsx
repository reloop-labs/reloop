"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Activity, Calendar, Clock, Mail, User } from "lucide-react";
import type * as React from "react";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	CONTACT_VIEW_COLUMNS,
	type ContactViewColumnId,
} from "../../hooks/use-contact-column-visibility";

const COLUMN_ICONS: Record<ContactViewColumnId, React.ReactNode> = {
	email: <Mail className="size-3.5" />,
	name: <User className="size-3.5" />,
	status: <Activity className="size-3.5" />,
	updatedAt: <Clock className="size-3.5" />,
	createdAt: <Calendar className="size-3.5" />,
};

export function ContactViewPopover({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: ContactViewColumnId, visible: boolean) => void;
}) {
	return (
		<DataTableViewOptions
			align="end"
			columns={CONTACT_VIEW_COLUMNS.map((column) => ({
				id: column.id,
				label: column.label,
				locked: column.id === "email",
				icon: COLUMN_ICONS[column.id],
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as ContactViewColumnId, visible)
			}
		/>
	);
}
