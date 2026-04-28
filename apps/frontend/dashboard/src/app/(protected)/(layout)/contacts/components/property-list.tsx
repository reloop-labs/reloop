"use client";

import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useQueryState } from "nuqs";
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
	const [currentPage, setCurrentPage] = useQueryState("propertyPage", {
		defaultValue: 1,
		parse: Number,
	});
	const [pageSize, setPageSize] = useQueryState("propertyLimit", {
		defaultValue: 10,
		parse: Number,
	});
	const [search, setSearch] = useState("");
	const [filters, setFilters] = useState<PropertyFilters>([]);

	// Convert filters to type filter for API
	const typeFilter = filters.length === 1 ? filters[0] : "";

	const buildUrl = () => {
		let url = `/api/contacts/v1/properties/list?limit=${pageSize}&page=${currentPage}`;
		if (search) url += `&search=${encodeURIComponent(search)}`;
		if (typeFilter) url += `&type=${typeFilter}`;
		return url;
	};

	const { data, isLoading, mutate } = useSWR<PropertyListResponse>(buildUrl());

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	const handleDeleteProperty = async (_propertyId: string) => {
		await mutate();
	};

	return (
		<div>
			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall">
						<Input.Wrapper>
							<Input.Icon as={Icon} name="search" size="xsmall" />
							<Input.Input
								placeholder="Search by name"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</Input.Wrapper>
					</Input.Root>
				</div>
				<PropertyFilterDropdown value={filters} onChange={setFilters} />
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
