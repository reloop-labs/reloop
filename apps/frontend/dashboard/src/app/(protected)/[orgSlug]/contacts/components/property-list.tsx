"use client";

import { useQueryState } from "nuqs";
import useSWR from "swr";
import { PropertyTable } from "./property-table";
import { PropertiesEmptyState } from "./properties-empty-state";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import * as Input from "@reloop/ui/input";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";

interface Property {
  id: string;
  name: string;
  type: string;
  fallbackValue: string | null;
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
  const [currentPage, setCurrentPage] = useQueryState("propertyPage", {
    defaultValue: 1,
    parse: Number,
  });
  const [pageSize, setPageSize] = useQueryState("propertyLimit", {
    defaultValue: 10,
    parse: Number,
  });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useQueryState("propertyType", {
    defaultValue: "",
  });

  const buildUrl = () => {
    let url = `/api/contacts/v1/properties/list?limit=${pageSize}&page=${currentPage}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (typeFilter) url += `&type=${typeFilter}`;
    return url;
  };

  const {
    data,
    isLoading,
    mutate,
  } = useSWR<PropertyListResponse>(buildUrl());

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleDeleteProperty = async (_propertyId: string) => {
    await mutate();
  };

  if (!isLoading && data?.properties.length === 0 && !search && !typeFilter) {
    return <PropertiesEmptyState />;
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input.Root size="small">
            <Input.Wrapper className="w-full">
              <Input.Icon as={Icon} name="search" />
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
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="h-9 rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 text-sm text-text-sub-600 outline-none focus:ring-2 focus:ring-primary-alpha-24"
        >
          <option value="">All types</option>
          <option value="string">String</option>
          <option value="number">Number</option>
        </select>
      </div>

      {/* Table */}
      <PropertyTable
        properties={data?.properties || []}
        isLoading={isLoading}
        onDelete={handleDeleteProperty}
      />

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-stroke-soft-200">
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-sub-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.total)} of {data.total} properties
            </span>
            <PageSizeDropdown
              value={pageSize}
              onValueChange={handlePageSizeChange}
            />
          </div>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};
