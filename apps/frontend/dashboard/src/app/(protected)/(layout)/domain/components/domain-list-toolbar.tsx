"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { DomainFilterDropdown } from "./domain-filter-dropdown";

export const DomainListToolbar = () => {
	const [statusFilters, setStatusFilters] = useQueryState(
		"status",
		parseAsStringLiteral([
			"pending",
			"verifying",
			"active",
			"suspended",
			"failed",
		] as const),
	);
	const [searchQuery, setSearchQuery] = useQueryState(
		"q",
		parseAsString.withDefault(""),
	);
	const [, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="xsmall" className="rounded-[10px]">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="xsmall" />
						<Input.Input
							placeholder="Search domains..."
							value={searchQuery}
							onChange={(e) => {
								setSearchQuery(e.target.value);
								setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<DomainFilterDropdown
				value={statusFilters}
				onChange={(filters) => {
					setStatusFilters(filters);
					setCurrentPage(1);
				}}
			/>
		</div>
	);
};
