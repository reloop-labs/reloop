"use client";

import { Hash, Type } from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";

const TYPE_VALUES = ["string", "number"] as const;

const typeOptions = [
	{
		label: "String",
		value: "string",
		icon: Type,
	},
	{
		label: "Number",
		value: "number",
		icon: Hash,
	},
] as const;

function normalizeTypeValues(values: string[]) {
	return TYPE_VALUES.filter((value) => values.includes(value));
}

export function PropertyTypeFilterChip({
	value,
	onChange,
}: {
	value: string[];
	onChange: (value: string[]) => void;
}) {
	return (
		<DataTableFacetedFilter
			title="Type"
			multiple
			options={[...typeOptions]}
			selectedValues={normalizeTypeValues(value)}
			onSelectedValuesChange={(values) => {
				onChange(normalizeTypeValues(values));
			}}
		/>
	);
}
