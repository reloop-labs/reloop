"use client";

import {
	CheckCircle2,
	Clock,
	Loader2,
	MinusCircle,
	XCircle,
} from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";
import type { CampaignStatus } from "../campaign-types";

const STATUS_VALUES: CampaignStatus[] = [
	"draft",
	"scheduled",
	"sending",
	"sent",
	"cancelled",
];

const statusOptions = [
	{
		label: "Draft",
		value: "draft",
		icon: MinusCircle,
	},
	{
		label: "Scheduled",
		value: "scheduled",
		icon: Clock,
	},
	{
		label: "Sending",
		value: "sending",
		icon: Loader2,
	},
	{
		label: "Sent",
		value: "sent",
		icon: CheckCircle2,
	},
	{
		label: "Cancelled",
		value: "cancelled",
		icon: XCircle,
	},
] as const;

function normalizeStatusValues(values: string[]) {
	return STATUS_VALUES.filter((value) => values.includes(value));
}

export function CampaignStatusFilterChip({
	value,
	onChange,
}: {
	value: string[];
	onChange: (value: string[]) => void;
}) {
	return (
		<DataTableFacetedFilter
			title="Status"
			multiple
			options={[...statusOptions]}
			selectedValues={normalizeStatusValues(value)}
			onSelectedValuesChange={(values) => {
				onChange(normalizeStatusValues(values));
			}}
		/>
	);
}
