"use client";

import {
	AlertCircle,
	CheckCircle2,
	Clock,
	MinusCircle,
	XCircle,
} from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";

const STATUS_VALUES = [
	"pending",
	"verifying",
	"active",
	"suspended",
	"failed",
] as const;

const statusOptions = [
	{
		label: "Not Started",
		value: "pending",
		icon: MinusCircle,
	},
	{
		label: "Verifying",
		value: "verifying",
		icon: Clock,
	},
	{
		label: "Active",
		value: "active",
		icon: CheckCircle2,
	},
	{
		label: "Suspended",
		value: "suspended",
		icon: AlertCircle,
	},
	{
		label: "Failed",
		value: "failed",
		icon: XCircle,
	},
] as const;

function normalizeStatusValues(values: string[]) {
	return STATUS_VALUES.filter((value) => values.includes(value));
}

export function DomainStatusFilterChip({
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
