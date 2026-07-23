import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import {
	parseAsInteger,
	parseAsString,
	parseAsStringLiteral,
	useQueryState,
} from "nuqs";
import { useInvalidateDomains } from "../hooks/use-domains-query";
import { DomainFilterDropdown } from "./domain-filter-dropdown";

export function DomainListToolbar() {
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

	const invalidate = useInvalidateDomains();

	return (
		<div className="flex items-center gap-2">
			<div className="flex-1">
				<Input.Root size="small" className="rounded-xl">
					<Input.Wrapper>
						<Input.Icon as={Icon} name="search" size="small" />
						<Input.Input
							placeholder="Search domains..."
							value={searchQuery}
							onChange={(e) => {
								void setSearchQuery(e.target.value);
								void setCurrentPage(1);
							}}
						/>
					</Input.Wrapper>
				</Input.Root>
			</div>
			<div className="flex items-center gap-2">
				<DomainFilterDropdown
					value={statusFilters}
					onChange={(filters) => {
						void setStatusFilters(filters);
						void setCurrentPage(1);
					}}
				/>
				<button
					type="button"
					onClick={() => void invalidate()}
					className="flex h-9 w-9 items-center justify-center rounded-xl border border-stroke-soft-100 bg-bg-white-0 text-text-sub-600 transition-colors hover:bg-bg-weak-50 hover:text-text-strong-950 dark:border-stroke-soft-100/40 shrink-0"
					title="Refresh domains"
				>
					<Icon name="rotate-cw" className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}
