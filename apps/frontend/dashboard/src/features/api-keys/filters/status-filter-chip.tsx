"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";

const STATUS_VALUES = ["enabled", "disabled"] as const;

const statusOptions = [
	{
		label: "Active",
		value: "enabled",
		icon: CheckCircle2,
	},
	{
		label: "Inactive",
		value: "disabled",
		icon: XCircle,
	},
] as const;

function normalizeStatusValues(values: string[]) {
	return STATUS_VALUES.filter((value) => values.includes(value));
}

export function ApiKeyStatusFilterChip({
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
