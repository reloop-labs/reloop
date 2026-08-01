"use client";

import { DataTableFacetedFilter } from "#/components/data-table/data-table-faceted-filter";
import { UserAvatar } from "#/features/dashboard/page-header/user-avatar";
import type { CreatedByUser } from "../types";

function creatorLabel(creator: CreatedByUser): string {
	return creator.name || creator.email?.split("@")[0] || "Unknown";
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
		icon: (
			<UserAvatar
				name={creator.name}
				email={creator.email || "unknown@reloop.sh"}
				image={creator.image}
				size="16"
				initialsClassName="text-[7px]"
			/>
		),
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
