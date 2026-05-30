"use client";
import { useUserOrganization } from "@fe/dashboard/providers/org-provider";
import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import useSWR, { useSWRConfig } from "swr";
import { ApiKeyListToolbar } from "./api-key-list-toolbar";
import { ApiKeyTable } from "./api-key-table";
import type { CreatedByUser } from "./api-key-user-filter-dropdown";
import { CreateApiKeyModal } from "./create-api-key-modal/index";

interface Member {
	id: string;
	role: string;
	user: {
		id: string;
		name: string | null;
		email: string;
		image?: string | null;
	};
	createdAt: Date;
}

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
	const { mutate } = useSWRConfig();
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
			keepPreviousData: true,
		},
	);

	// Fetch organization members to populate the creator filter dropdown
	const { data: membersData } = useSWR<{ members: Member[] }>(
		activeOrganization?.id
			? `organization-member-${activeOrganization.id}`
			: null,
		async () => {
			if (!activeOrganization?.id) return { members: [] };
			const result = await authClient.organization.listMembers({
				query: { organizationId: activeOrganization.id },
			});
			return result.data ?? { members: [] };
		},
	);

	// Extract unique creators from organization members
	const availableCreators = useMemo<CreatedByUser[]>(() => {
		const members = membersData?.members ?? [];
		return members.map((m) => ({
			id: m.user.id,
			name: m.user.name,
			image: m.user.image ?? null,
			email: m.user.email,
		}));
	}, [membersData]);

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
								mutate={mutate}
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
