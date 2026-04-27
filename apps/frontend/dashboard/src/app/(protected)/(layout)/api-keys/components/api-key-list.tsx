"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { Icon } from "@reloop/ui/icon";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import useSWR from "swr";
import { ApiKeyListToolbar } from "./api-key-list-toolbar";
import { ApiKeyTable } from "./api-key-table";
import type { CreatedByUser } from "./api-key-user-filter-dropdown";
import { CreateApiKeyModal } from "./create-api-key-modal/index";

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
	lastRequest: string | null;
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

export const ApiKeyList = () => {
	const { activeOrganization } = useUserOrganization();
	const [statusFilter] = useQueryState("status", parseAsString.withDefault(""));
	const [creatorFilter] = useQueryState(
		"creator",
		parseAsString.withDefault(""),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [modal, setModal] = useQueryState("modal");
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const { data, error, isLoading } = useSWR<ApiKeyListResponse>(
		activeOrganization?.id
			? `/api/api-key/v1/?limit=${pageSize}&page=${currentPage}${
					statusFilter === "enabled"
						? "&enabled=true"
						: statusFilter === "disabled"
							? "&enabled=false"
							: ""
				}${creatorFilter ? `&userId=${creatorFilter}` : ""}${
					searchQuery ? `&q=${searchQuery}` : ""
				}`
			: null,
		{
			revalidateOnFocus: true,
			revalidateOnReconnect: true,
		},
	);

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

	return (
		<div className="pb-8">
			<div>
				{error ? (
					<div className="flex flex-col items-center justify-center gap-2 p-4">
						<Icon name="alert-circle" className="h-8 w-8 text-red-500" />
						<p className="text-center text-sm text-text-sub-600">
							Failed to load API keys
						</p>
					</div>
				) : (
					<div>
						<ApiKeyListToolbar availableCreators={availableCreators} />

						<div className="mt-4">
							<ApiKeyTable
								apiKeys={data?.apiKeys || []}
								total={data?.total || 0}
								isLoading={isLoading}
								loadingRows={4}
							/>
						</div>
					</div>
				)}
			</div>
			<CreateApiKeyModal
				isOpen={modal === "create-api-key"}
				onClose={() => setModal(null)}
			/>
		</div>
	);
};
