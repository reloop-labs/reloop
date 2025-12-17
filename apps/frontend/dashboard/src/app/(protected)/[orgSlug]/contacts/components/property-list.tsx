"use client";

import { useQueryState } from "nuqs";
import useSWR from "swr";
import { PropertyTable } from "./property-table";
import { PropertiesEmptyState } from "./properties-empty-state";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import * as Input from "@reloop/ui/input";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import { useState } from "react";
import { PropertyFilterDropdown, type PropertyFilters } from "./property-filter-dropdown";

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

interface PropertyListProps {
  onAddProperty?: () => void;
}

export const PropertyList = ({ onAddProperty }: PropertyListProps) => {
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

  const {
    data,
    isLoading,
    mutate,
  } = useSWR<PropertyListResponse>(buildUrl());

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

  const handleDeleteProperty = async (_propertyId: string) => {
    await mutate();
  };

  if (!isLoading && data?.properties.length === 0 && !search && filters.length === 0) {
    return <PropertiesEmptyState onAddProperty={onAddProperty} />;
  }

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
          isLoading={isLoading}
          loadingRows={4}
          onDelete={handleDeleteProperty}
        />
      </div>

      {/* Pagination */}
      {data && data.total > 0 && (
        <div className="mt-4 pb-8 flex items-center justify-between text-paragraph-sm text-text-sub-600">
          <div className="flex items-center gap-3">
            <span>
              Showing {startIndex}–{endIndex} of {data.total} propert{data.total !== 1 ? "ies" : "y"}
            </span>
            <PageSizeDropdown
              value={pageSize}
              onValueChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="xsmall"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
            >
              <Icon name="chevron-left" className="h-4 w-4" />
            </Button.Root>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button.Root
              variant="neutral"
              mode="stroke"
              size="xsmall"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || isLoading}
              className="transition-all duration-200 hover:border-primary-base hover:bg-bg-weak-50/50"
            >
              <Icon name="chevron-right" className="h-4 w-4" />
            </Button.Root>
          </div>
        </div>
      )}
    </div>
  );
};
