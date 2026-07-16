import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { ApiKeyListToolbar } from "./api-key-list-toolbar";
import { ApiKeyTable } from "./api-key-table";
import { CreateApiKeyModal } from "./create-api-key-modal";
import type { CreatedByUser } from "./types";
import { useApiKeysQuery } from "./use-api-keys-query";

export function ApiKeyList() {
	const { activeOrganization } = useActiveOrganization();
	const [statusFilter] = useQueryState("status", parseAsString.withDefault(""));
	const [creatorFilter] = useQueryState(
		"creator",
		parseAsString.withDefault(""),
	);
	const [searchQuery] = useQueryState("q", parseAsString.withDefault(""));
	const [modal, setModal] = useQueryState("modal");
	const [currentPage] = useQueryState("page", parseAsInteger.withDefault(1));
	const [pageSize] = useQueryState("limit", parseAsInteger.withDefault(10));

	const listParams = {
		page: currentPage ?? 1,
		limit: pageSize ?? 10,
		status: statusFilter ?? "",
		creator: creatorFilter ?? "",
		q: searchQuery ?? "",
	};

	const { data, error, isPending, isFetching } = useApiKeysQuery({
		...listParams,
		enabled: !!activeOrganization?.id,
	});

	const orgId = activeOrganization?.id;
	const { data: membersData } = useQuery({
		queryKey: queryKeys.organization.members(orgId ?? ""),
		queryFn: async () => {
			if (!orgId) return { members: [] };
			const result = await authClient.organization.listMembers({
				query: { organizationId: orgId },
			});
			return (
				(result.data as {
					members: {
						user: {
							id: string;
							name: string | null;
							email: string;
							image?: string | null;
						};
					}[];
				}) ?? { members: [] }
			);
		},
		enabled: !!orgId,
	});

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
			{error ? (
				<div className="flex flex-col items-center justify-center gap-2 p-4">
					<Icon name="alert-circle" className="h-8 w-8 text-error-base" />
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
							listParams={listParams}
							isLoading={isPending || isFetching}
							loadingRows={4}
						/>
					</div>
				</div>
			)}
			<CreateApiKeyModal
				isOpen={modal === "create-api-key"}
				onClose={() => void setModal(null)}
			/>
		</div>
	);
}
