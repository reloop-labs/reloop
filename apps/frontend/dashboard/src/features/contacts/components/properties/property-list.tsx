import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { usePropertiesQuery } from "../../hooks/use-contacts-query";
import {
	PropertyFilterDropdown,
	type PropertyFilters,
} from "./property-filter-dropdown";
import { PropertyTable } from "./property-table";

export function PropertyList() {
	const { activeOrganization } = useActiveOrganization();
	const [, setModal] = useQueryState("modal");
	const [currentPage, setCurrentPage] = useQueryState(
		"propertyPage",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"propertyLimit",
		parseAsInteger.withDefault(10),
	);
	const [search, setSearch] = useState("");
	const [filter, setFilter] = useState<PropertyFilters>(null);

	const { data, isPending, isFetching } = usePropertiesQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search,
		type: filter ?? "",
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	return (
		<div>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall" className="rounded-[10px]">
						<Input.Wrapper>
							<Input.Icon
								as={Icon}
								name="search"
								size="xsmall"
								className="h-3.5 w-3.5"
							/>
							<Input.Input
								placeholder="Search properties..."
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									void setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<PropertyFilterDropdown
					value={filter}
					onChange={(v) => {
						setFilter(v);
						void setCurrentPage(1);
					}}
				/>
			</div>
			<div className="mt-4">
				<PropertyTable
					properties={data?.properties || []}
					total={data?.total || 0}
					isLoading={isLoading}
					onAddProperty={() => void setModal("add-property")}
					currentPage={currentPage ?? 1}
					pageSize={pageSize ?? 10}
					onPageChange={(p) => void setCurrentPage(p)}
					onPageSizeChange={(v) => {
						void setPageSize(v);
						void setCurrentPage(1);
					}}
				/>
			</div>
		</div>
	);
}
