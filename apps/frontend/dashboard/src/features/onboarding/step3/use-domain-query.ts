import { queryOptions, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryKeys } from "#/lib/query-keys";
import type { DomainNameserversResponse, DomainResponse } from "./domain-types";

export function domainDetailQueryOptions(domainId: string) {
	return queryOptions({
		queryKey: queryKeys.domain.detail(domainId),
		queryFn: async (): Promise<DomainResponse> => {
			const { data } = await axios.get<DomainResponse>(
				`/api/domain/v1/${domainId}`,
				{ withCredentials: true },
			);
			return data;
		},
		enabled: Boolean(domainId),
		refetchInterval: (query) =>
			query.state.data?.status === "verifying" ? 3000 : false,
	});
}

export function domainNameserversQueryOptions(domainId: string) {
	return queryOptions({
		queryKey: queryKeys.domain.nameservers(domainId),
		queryFn: async (): Promise<DomainNameserversResponse> => {
			const { data } = await axios.get<DomainNameserversResponse>(
				`/api/domain/v1/nameservers/${domainId}`,
				{ withCredentials: true },
			);
			return data;
		},
		enabled: Boolean(domainId),
	});
}

export function useDomainQuery(domainId: string) {
	return useQuery(domainDetailQueryOptions(domainId));
}

export function useDomainNameserversQuery(domainId: string) {
	return useQuery(domainNameserversQueryOptions(domainId));
}
