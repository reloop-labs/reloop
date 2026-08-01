import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import type { ApiKeyListResponse } from "../types";

export type ApiKeysListParams = {
	page: number;
	limit: number;
	/** Selected status values (`enabled` / `disabled`). Exactly one applies a filter. */
	status: string[];
	creator: string;
	q: string;
	enabled?: boolean;
};

function buildListUrl(params: ApiKeysListParams): string {
	const search = new URLSearchParams();
	search.set("limit", String(params.limit));
	search.set("page", String(params.page));
	if (params.status.length === 1 && params.status[0] === "enabled") {
		search.set("enabled", "true");
	}
	if (params.status.length === 1 && params.status[0] === "disabled") {
		search.set("enabled", "false");
	}
	if (params.creator) search.set("userId", params.creator);
	if (params.q) search.set("q", params.q);
	return `/api/api-key/v1/?${search.toString()}`;
}

async function fetchApiKeys(
	params: ApiKeysListParams,
): Promise<ApiKeyListResponse> {
	const res = await fetch(buildListUrl(params), { credentials: "include" });
	if (!res.ok) {
		throw new Error(`Failed to load API keys (${res.status})`);
	}
	return res.json() as Promise<ApiKeyListResponse>;
}

export function useApiKeysQuery(params: ApiKeysListParams) {
	return useQuery({
		queryKey: queryKeys.apiKeys.list({
			page: params.page,
			limit: params.limit,
			status: [...params.status].sort().join(","),
			creator: params.creator,
			q: params.q,
		}),
		queryFn: () => fetchApiKeys(params),
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
	});
}

export function useInvalidateApiKeys() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.apiKeys.all });
}
