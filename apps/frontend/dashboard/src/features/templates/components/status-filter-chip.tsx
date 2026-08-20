"use client";

import { Archive, CheckCircle2, Clock } from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";

const STATUS_VALUES = ["draft", "published", "archived"] as const;

const statusOptions = [
	{
		label: "Draft",
		value: "draft",
		icon: Clock,
	},
	{
		label: "Published",
		value: "published",
		icon: CheckCircle2,
	},
	{
		label: "Archived",
		value: "archived",
		icon: Archive,
	},
] as const;

function normalizeStatusValues(values: string[]) {
	return STATUS_VALUES.filter((value) => values.includes(value));
}

export function TemplateStatusFilterChip({
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
