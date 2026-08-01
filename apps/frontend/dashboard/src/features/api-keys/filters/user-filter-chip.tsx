"use client";

import { User } from "lucide-react";
import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";
import type { CreatedByUser } from "../types";

function creatorLabel(creator: CreatedByUser) {
	return (
		creator.name || (creator.email ? creator.email.split("@")[0] : "Unknown")
	);
}

export function ApiKeyUserFilterChip({
	value,
	onChange,
	availableCreators,
}: {
	value: string | null;
	onChange: (value: string | null) => void;
	availableCreators: CreatedByUser[];
}) {
	const options = availableCreators.map((creator) => ({
		label: creatorLabel(creator),
		value: creator.id,
		icon: User,
	}));

	return (
		<DataTableFacetedFilter
			title="User"
			multiple={false}
			options={options}
			selectedValues={value ? [value] : []}
			onSelectedValuesChange={(values) => {
				onChange(values[0] ?? null);
			}}
		/>
	);
}
