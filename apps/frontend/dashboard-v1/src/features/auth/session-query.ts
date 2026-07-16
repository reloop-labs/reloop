import { authClient } from "@reloop/auth/client";
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "#/lib/query-keys";

export type SessionData = NonNullable<
	Awaited<ReturnType<typeof authClient.getSession>>["data"]
>;

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.session(),
		queryFn: async (): Promise<SessionData | null> => {
			const { data, error } = await authClient.getSession();
			if (error) {
				throw new Error(error.message || "Failed to load session");
			}
			return data ?? null;
		},
	});
}

export function useSessionQuery() {
	return useQuery(sessionQueryOptions());
}

/** Call after sign-in / sign-out so session cache stays correct. */
export function useInvalidateSession() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
}
