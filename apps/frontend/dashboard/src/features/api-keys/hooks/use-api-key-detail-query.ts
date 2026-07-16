import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import type { ApiKeyDetail } from "../types";

async function fetchApiKeyDetail(id: string): Promise<ApiKeyDetail> {
	const res = await fetch(`/api/api-key/v1/${id}`, {
		credentials: "include",
	});
	if (!res.ok) {
		throw new Error(`Failed to load API key (${res.status})`);
	}
	return res.json() as Promise<ApiKeyDetail>;
}

export function useApiKeyDetailQuery(apiKeyId: string | undefined) {
	return useQuery({
		queryKey: queryKeys.apiKeys.detail(apiKeyId ?? ""),
		queryFn: () => fetchApiKeyDetail(apiKeyId as string),
		enabled: !!apiKeyId,
	});
}
