import * as Button from "@reloop/ui/button";
import { cn } from "@reloop/ui/cn";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
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
	const [searchQuery, setSearchQuery] = useQueryState(
		"search",
		parseAsString.withDefault(""),
	);
	const [typeFilter, setTypeFilter] = useQueryState(
		"type",
		parseAsString.withDefault(""),
	);

	const { data, isPending, isFetching, refetch } = usePropertiesQuery({
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		search: searchQuery ?? "",
		type: typeFilter ?? "",
		enabled: !!activeOrganization?.id,
	});
	const isLoading = isPending || (isFetching && !data);

	return (
		<div>
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<Input.Root size="small" className="rounded-xl">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="small" />
							<Input.Input
								placeholder="Search properties..."
								value={searchQuery ?? ""}
								onChange={(e) => {
									void setSearchQuery(e.target.value || null);
									void setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<PropertyFilterDropdown
					value={(typeFilter as PropertyFilters) || null}
					onChange={(v) => {
						void setTypeFilter(v || null);
						void setCurrentPage(1);
					}}
				/>
				<Button.Root
					variant="neutral"
					mode="stroke"
					size="small"
					onClick={() => void refetch()}
					disabled={isFetching}
					className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl p-0"
					title="Refresh properties"
					aria-label="Refresh properties"
				>
					<Button.Icon
						as={Icon}
						name="refresh-cw"
						className={cn(
							"h-4 w-4 text-text-sub-600 transition-transform",
							isFetching && "animate-spin",
						)}
					/>
				</Button.Root>
			</div>
			<div className="mt-4">
				<PropertyTable
					properties={data?.properties || []}
					total={data?.total || 0}
					isLoading={isLoading}
					onAddProperty={() => void setModal("add-property")}
					searchQuery={searchQuery ?? ""}
					typeFilter={typeFilter ?? ""}
					onClearFilters={() => {
						void setSearchQuery(null);
						void setTypeFilter(null);
						void setCurrentPage(1);
					}}
					onClearSearch={() => {
						void setSearchQuery(null);
						void setCurrentPage(1);
					}}
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
