"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { DomainListResponse } from "@reloop/api";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { useParams, useRouter } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useSWR from "swr";
import { DeleteDomainModal } from "./delete-domain";
import { DomainErrorState } from "./domain-error-state";
import {
	DomainFilterDropdown,
	type DomainStatusFilters,
} from "./domain-filter-dropdown";
import { DomainListHeader } from "./domain-list-header";
import { DomainTable } from "./domain-table";

export const DomainListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const { domainId } = useParams();
	const router = useRouter();
	const [statusFilters, setStatusFilters] = useState<DomainStatusFilters>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const { data, error, isLoading } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}&limit=${pageSize}&page=${currentPage}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	useHotkeys("mod+a", () => {
		router.push("/domain/add");
	});

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	// Filter domains based on status and search query
	const filteredDomains =
		data?.domains?.filter((domain) => {
			const matchesStatus =
				statusFilters.length === 0 || statusFilters.includes(domain.status);
			const matchesSearch =
				searchQuery === "" ||
				domain.domain.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesSearch;
		}) || [];

	if (error) {
		return <DomainErrorState />;
	}

	return (
		<div className="mx-auto max-w-4xl sm:px-8">
			<DomainListHeader />

			<div className="flex items-center gap-3">
				<div className="flex-1">
					<Input.Root size="xsmall">
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
					onChange={setStatusFilters}
				/>
			</div>

			<div className="mt-4">
				<DomainTable
					domains={filteredDomains}
					currentDomainId={domainId as string}
					isLoading={isLoading}
					loadingRows={4}
				/>
			</div>

			{/* Pagination */}
			{data && data.total > 0 && (
				<div className="mt-4 flex items-center justify-between pb-8 text-paragraph-sm text-text-sub-600">
					<div className="flex items-center gap-3">
						<span>
							Showing {startIndex}–{endIndex} of {data.total} domain
							{data.total !== 1 ? "s" : ""}
						</span>
						<PageSizeDropdown
							value={pageSize}
							onValueChange={(value) => {
								setPageSize(value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<PaginationControls
						currentPage={currentPage}
						totalPages={totalPages}
						onPageChange={setCurrentPage}
						isLoading={isLoading}
					/>
				</div>
			)}

			<DeleteDomainModal domains={data?.domains || []} />
		</div>
	);
};
