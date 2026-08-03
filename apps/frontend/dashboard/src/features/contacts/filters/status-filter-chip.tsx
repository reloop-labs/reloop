"use client";

import { CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";

const STATUS_VALUES = ["subscribed", "unsubscribed", "blocked"] as const;

const statusOptions = [
	{
		label: "Subscribed",
		value: "subscribed",
		icon: CheckCircle2,
	},
	{
		label: "Unsubscribed",
		value: "unsubscribed",
		icon: MinusCircle,
	},
	{
		label: "Blocked",
		value: "blocked",
		icon: XCircle,
	},
] as const;

function normalizeStatusValues(values: string[]) {
	return STATUS_VALUES.filter((value) => values.includes(value));
}

export function ContactStatusFilterChip({
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
