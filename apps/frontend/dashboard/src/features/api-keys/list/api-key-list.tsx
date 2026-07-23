import { authClient } from "@reloop/auth/client";
import { Icon } from "@reloop/ui/icon";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import { useActiveOrganization } from "#/features/dashboard/page-header/use-active-organization";
import { queryKeys } from "#/lib/query-keys";
import { useApiKeysQuery } from "../hooks/use-api-keys-query";
import { CreateApiKeyModal } from "../modals/create-api-key-modal";
import { ApiKeyTable } from "../table/api-key-table";
import type { CreatedByUser } from "../types";
import { ApiKeyListToolbar } from "./api-key-list-toolbar";

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
	const [deletedName, setDeletedName] = useState<string | null>(null);

	useEffect(() => {
		if (deletedName) {
			const timer = setTimeout(() => setDeletedName(null), 8000);
			return () => clearTimeout(timer);
		}
	}, [deletedName]);

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
			{deletedName && (
				<AnimatePresence>
					<motion.div
						initial={{ opacity: 0, y: -8, height: 0 }}
						animate={{ opacity: 1, y: 0, height: "auto" }}
						exit={{ opacity: 0, y: -8, height: 0 }}
						transition={{ duration: 0.2 }}
						className="mb-4 overflow-hidden"
					>
						<div className="flex items-center justify-between rounded-xl border border-[#B7F1D0] bg-[#E8FAF0] px-4 py-3 text-sm text-[#0F5C34] dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-200">
							<span>
								API key &quot;<span className="font-semibold">{deletedName}</span>&quot; has been successfully deleted.
							</span>
							<button
								type="button"
								onClick={() => setDeletedName(null)}
								className="p-1 text-[#0F5C34]/70 transition-colors hover:text-[#0F5C34] dark:text-emerald-200/70 dark:hover:text-emerald-200"
							>
								<Icon name="close" className="h-4 w-4" />
							</button>
						</div>
					</motion.div>
				</AnimatePresence>
			)}

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
							onDeleteSuccess={(name) => setDeletedName(name)}
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
