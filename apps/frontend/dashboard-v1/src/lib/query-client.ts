import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				// Prefer RQ over SWR for all server state in dashboard-v1.
				staleTime: 30_000,
				gcTime: 5 * 60_000,
				refetchOnWindowFocus: true,
				refetchOnReconnect: true,
				retry: 1,
			},
		},
	});
}
