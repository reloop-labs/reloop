"use client";
import { PageSizeDropdown } from "@fe/dashboard/components/page-size-dropdown";
import { PaginationControls } from "@fe/dashboard/components/pagination-controls";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import * as Button from "@reloop/ui/button";
import { Icon } from "@reloop/ui/icon";
import * as Input from "@reloop/ui/input";
import { parseAsInteger, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import useSWR from "swr";
import {
	ApiKeyFilterDropdown,
	type ApiKeyFilters,
	type CreatedByUser,
} from "./api-key-filter-dropdown";
import { ApiKeyTable } from "./api-key-table";
import { CreateApiKeyModal } from "./create-api-key-modal";
import { EmptyState } from "./empty-state";

interface ApiKeyData {
	id: string;
	name: string | null;
	start: string | null;
	prefix: string | null;
	enabled: boolean;
	requestCount: number;
	remaining: number | null;
	expiresAt: string | null;
	createdAt: string;
	createdBy?: {
		id: string;
		name: string | null;
		image: string | null;
		email: string | null;
	};
}

interface ApiKeyListResponse {
	apiKeys: ApiKeyData[];
	total: number;
	page: number;
	limit: number;
}

export const ApiKeyListSidebar = () => {
	const { activeOrganization } = useUserOrganization();
	const [filters, setFilters] = useState<ApiKeyFilters>({
		status: [],
		createdBy: [],
	});
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [currentPage, setCurrentPage] = useQueryState(
		"page",
		parseAsInteger.withDefault(1),
	);
	const [pageSize, setPageSize] = useQueryState(
		"limit",
		parseAsInteger.withDefault(10),
	);

	const { data, error, isLoading } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id
			? `/api/api-key/v1/?limit=${pageSize}&page=${currentPage}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

	const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
	const startIndex = (currentPage - 1) * pageSize + 1;
	const endIndex = Math.min(currentPage * pageSize, data?.total || 0);

	// Extract unique creators from API keys
	const availableCreators = useMemo<CreatedByUser[]>(() => {
		if (!data?.apiKeys) return [];
		const creatorsMap = new Map<string, CreatedByUser>();
		for (const apiKey of data.apiKeys) {
			if (apiKey.createdBy?.id && !creatorsMap.has(apiKey.createdBy.id)) {
				creatorsMap.set(apiKey.createdBy.id, {
					id: apiKey.createdBy.id,
					name: apiKey.createdBy.name,
					image: apiKey.createdBy.image,
				});
			}
		}
		return Array.from(creatorsMap.values());
	}, [data?.apiKeys]);

	// Filter API keys based on status, creator, and search query
	const filteredApiKeys =
		data?.apiKeys?.filter((apiKey) => {
			const matchesStatus =
				filters.status.length === 0 ||
				(filters.status.includes("enabled") && apiKey.enabled) ||
				(filters.status.includes("disabled") && !apiKey.enabled);

			const matchesCreator =
				filters.createdBy.length === 0 ||
				(apiKey.createdBy?.id &&
					filters.createdBy.includes(apiKey.createdBy.id));

			const displayName = apiKey.name || apiKey.start || apiKey.prefix || "";
			const matchesSearch =
				searchQuery === "" ||
				displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
				apiKey.prefix?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				apiKey.start?.toLowerCase().includes(searchQuery.toLowerCase());
			return matchesStatus && matchesCreator && matchesSearch;
		}) || [];

	return (
		<div className="mx-auto max-w-3xl sm:px-8">
			<div className="flex items-center justify-between pt-10">
				<p className="font-medium text-2xl">
					API Key{data?.apiKeys.length !== 1 ? "s" : ""}
				</p>
				<div className="flex items-center gap-2">
					<Button.Root
						variant="neutral"
						size="xsmall"
						onClick={() => setIsCreateModalOpen(true)}
					>
						<Icon name="plus" className="h-4 w-4" />
						Create API key
					</Button.Root>
				</div>
			</div>

			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load API keys
						</p>
					</div>
				) : data?.apiKeys && data.apiKeys.length === 0 ? (
					<EmptyState onCreateApiKey={() => setIsCreateModalOpen(true)} />
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
											placeholder="Search API keys..."
											value={searchQuery}
											onChange={(e) => setSearchQuery(e.target.value)}
										/>
									</Input.Wrapper>
								</Input.Root>
							</div>
							<ApiKeyFilterDropdown
								value={filters}
								onChange={setFilters}
								availableCreators={availableCreators}
							/>
						</div>

						<div className="mt-4">
							<ApiKeyTable
								apiKeys={filteredApiKeys}
								activeOrganizationSlug={activeOrganization?.slug || ""}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>

						{/* Pagination */}
						{data && data.total > 0 && (
							<div className="mt-4 flex items-center justify-between pb-8 text-paragraph-sm text-text-sub-600">
								<div className="flex items-center gap-3">
									<span>
										Showing {startIndex}–{endIndex} of {data.total} API key
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
					</div>
				)}
			</div>
			<CreateApiKeyModal
				isOpen={isCreateModalOpen}
				onClose={() => setIsCreateModalOpen(false)}
			/>
		</div>
	);
};
