import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";
import type {
	DomainListResponse,
	DomainNameserversResponse,
	DomainResponse,
} from "../types";

export type DomainsListParams = {
	page: number;
	limit: number;
	/** Selected status values. Exactly one applies a filter (matches API keys). */
	status: string[];
	q: string;
	enabled?: boolean;
};

async function fetchDomainList(
	params: DomainsListParams,
): Promise<DomainListResponse> {
	const search = new URLSearchParams();
	search.set("limit", String(params.limit));
	search.set("page", String(params.page));
	// Backend accepts a single status; only apply when exactly one is selected.
	if (params.status.length === 1 && params.status[0]) {
		search.set("status", params.status[0]);
	}
	if (params.q) search.set("q", params.q);
	const res = await fetch(`/api/domain/v1/list?${search.toString()}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load domains (${res.status})`);
	return res.json() as Promise<DomainListResponse>;
}

async function fetchDomainDetail(id: string): Promise<DomainResponse> {
	const res = await fetch(`/api/domain/v1/${id}`, { credentials: "include" });
	if (!res.ok) {
		const err = new Error(`Failed to load domain (${res.status})`) as Error & {
			status?: number;
		};
		err.status = res.status;
		throw err;
	}
	return res.json() as Promise<DomainResponse>;
}

async function fetchNameservers(
	id: string,
): Promise<DomainNameserversResponse> {
	const res = await fetch(`/api/domain/v1/nameservers/${id}`, {
		credentials: "include",
	});
	if (!res.ok) throw new Error(`Failed to load nameservers (${res.status})`);
	return res.json() as Promise<DomainNameserversResponse>;
}

export function useDomainsQuery(params: DomainsListParams) {
	return useQuery({
		queryKey: queryKeys.domain.list({
			page: params.page,
			limit: params.limit,
			status: [...params.status].sort().join(","),
			q: params.q,
		}),
		queryFn: () => fetchDomainList(params),
		enabled: params.enabled !== false,
		placeholderData: (prev) => prev,
		refetchInterval: (query) =>
			query.state.data?.domains?.some((d) => d.status === "verifying")
				? 3000
				: false,
	});
}

export function useDomainDetailQuery(
	domainId: string | null | undefined,
	enabled = true,
) {
	return useQuery({
		queryKey: queryKeys.domain.detail(domainId ?? ""),
		queryFn: () => fetchDomainDetail(domainId as string),
		enabled: !!domainId && enabled,
		refetchInterval: (query) =>
			query.state.data?.status === "verifying" ? 3000 : false,
	});
}

export function useDomainNameserversQuery(
	domainId: string | null | undefined,
	enabled = true,
) {
	return useQuery({
		queryKey: queryKeys.domain.nameservers(domainId ?? ""),
		queryFn: () => fetchNameservers(domainId as string),
		enabled: !!domainId && enabled,
		staleTime: 0,
	});
}

export function useInvalidateDomains() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.domain.all });
}
