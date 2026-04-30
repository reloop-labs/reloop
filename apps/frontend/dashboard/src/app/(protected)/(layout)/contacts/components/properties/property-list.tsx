"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useQueryState, parseAsInteger } from "nuqs";
import { useState } from "react";
import useSWR from "swr";
import {
	PropertyFilterDropdown,
	type PropertyFilters,
} from "./property-filter-dropdown";
import { PropertyTable } from "./property-table";

interface Property {
	id: string;
	propertyName: string;
	propertyType: string;
	defaultValue: string | null;
	organizationId: string;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
}

interface PropertyListResponse {
	properties: Property[];
	total: number;
	page: number;
	limit: number;
}

export const PropertyList = () => {
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

	const buildUrl = () => {
		let url = `/api/contacts/v1/properties/list?limit=${pageSize}&page=${currentPage}`;
		if (search) url += `&search=${encodeURIComponent(search)}`;
		if (filter) url += `&type=${filter}`;
		return url;
	};

	const { data, isLoading, mutate } = useSWR<PropertyListResponse>(buildUrl());

	const handleDeleteProperty = async (_propertyId: string) => {
		await mutate();
	};

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
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<PropertyFilterDropdown
					value={filter}
					onChange={(newFilter) => {
						setFilter(newFilter);
						setCurrentPage(1);
					}}
				/>
			</div>

			<div className="mt-4">
				<PropertyTable
					properties={data?.properties || []}
					total={data?.total || 0}
					currentPage={currentPage}
					pageSize={pageSize}
					onPageChange={setCurrentPage}
					onPageSizeChange={(size) => {
						setPageSize(size);
						setCurrentPage(1);
					}}
					isLoading={isLoading}
					loadingRows={4}
					onDelete={handleDeleteProperty}
					onAddProperty={() => setModal("add-property")}
				/>
			</div>
		</div>
	);
};
