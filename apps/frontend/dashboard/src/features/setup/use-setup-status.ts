"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { queryKeys } from "#/lib/query-keys";
import { fetchSetupStatus } from "./setup-api";

export function setupStatusQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.setupStatus(),
		queryFn: ({ signal }) => fetchSetupStatus(signal),
		staleTime: Number.POSITIVE_INFINITY,
		gcTime: Number.POSITIVE_INFINITY,
		retry: 2,
		retryDelay: 1_000,
	});
}

export function useSetupStatusQuery(enabled = true) {
	return useQuery({
		...setupStatusQueryOptions(),
		enabled: enabled && typeof window !== "undefined",
	});
}

export function useRedirectIfSetupRequired(enabled = true) {
	const router = useRouter();
	const { data, isPending, isError, isFetched } = useSetupStatusQuery(enabled);

	const isSetupRequired = enabled && data?.required === true;
	const isCheckingSetup = enabled && (isPending || isError || !isFetched);

	useEffect(() => {
		if (!isSetupRequired) return;
		router.replace("/setup");
	}, [isSetupRequired, router]);

	return {
		isSetupRequired,
		isCheckingSetup,
		shouldBlockForSetup: isCheckingSetup || isSetupRequired,
	};
}
