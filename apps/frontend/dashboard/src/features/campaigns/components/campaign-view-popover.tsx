"use client";

import type { VisibilityState } from "@tanstack/react-table";
import { Activity, Clock, Megaphone, Users } from "lucide-react";
import type * as React from "react";
import { DataTableViewOptions } from "#/components/data-table/data-table-view-options";
import {
	CAMPAIGN_VIEW_COLUMNS,
	type CampaignViewColumnId,
} from "../hooks/use-campaign-column-visibility";

const COLUMN_ICONS: Record<CampaignViewColumnId, React.ReactNode> = {
	campaign: <Megaphone className="size-3.5" />,
	status: <Activity className="size-3.5" />,
	audience: <Users className="size-3.5" />,
	sentAt: <Clock className="size-3.5" />,
};

export function CampaignViewPopover({
	columnVisibility,
	onColumnVisibleChange,
}: {
	columnVisibility: VisibilityState;
	onColumnVisibleChange: (id: CampaignViewColumnId, visible: boolean) => void;
}) {
	return (
		<DataTableViewOptions
			align="end"
			columns={CAMPAIGN_VIEW_COLUMNS.map((column) => ({
				id: column.id,
				label: column.label,
				locked: column.id === "campaign",
				icon: COLUMN_ICONS[column.id],
			}))}
			visibility={columnVisibility}
			onVisibilityChange={(id, visible) =>
				onColumnVisibleChange(id as CampaignViewColumnId, visible)
			}
		/>
	);
}
