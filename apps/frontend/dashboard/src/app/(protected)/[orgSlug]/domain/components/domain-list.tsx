"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import type { DomainListResponse } from "@reloop/api";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import useSWR from "swr";
import { DeleteDomainModal } from "./delete-domain";
import { DomainFilterDropdown, type DomainStatusFilters } from "./domain-filter-dropdown";

import { DomainTable } from "./domain-table";
import { EmptyState } from "./empty-state";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";

export const DomainListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const { domainId } = useParams();
	const [statusFilters, setStatusFilters] = useState<DomainStatusFilters>([]);
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [currentPage, setCurrentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize, setPageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const { data, error, isLoading } = useSWR<DomainListResponse>(
		activeOrganization?.id
			? `/api/domain/v1/list?organizationId=${activeOrganization.id}&limit=${pageSize}&page=${currentPage}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

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

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">
					Domain{data?.domains.length !== 1 ? "s" : ""}
				</p>
				<div className="flex items-center gap-2">
					<Link
						className={Button.buttonVariants({
							variant: "neutral",
							size: "xsmall",
						}).root()}
						href={`/${activeOrganization.slug}/domain/add`}
					>
						<Icon name="plus" className="h-4 w-4" />
						Add domain
					</Link>
				</div>
			</div>
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load domains
						</p>
					</div>
				) : data?.domains && data.domains.length === 0 ? (
					<EmptyState />
				) : (
					<div>
						<div className="mt-10 flex items-center gap-3">
							<div className="flex-1">
								<Input.Root size="small" className="rounded-xl">
									<Input.Wrapper>
										<Input.Icon
											as={() => <Icon name="search" className="h-4 w-4" />}
										/>
										<Input.Input
											type="text"
											placeholder="Search domains..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
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
								activeOrganizationSlug={activeOrganization.slug}
								currentDomainId={domainId as string}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>

						{/* Pagination */}
						{data && data.total > 0 && (
							<div className="mt-4 pb-8 flex items-center justify-between text-paragraph-sm text-text-sub-600">
								<div className="flex items-center gap-3">
									<span>
										Showing {startIndex}–{endIndex} of {data.total} domain{data.total !== 1 ? "s" : ""}
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
					</div>
				)}
			</div>
			<DeleteDomainModal domains={data?.domains || []} />
		</div>
	);
};
