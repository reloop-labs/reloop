import { authClient } from "@reloop/auth/client";
import {
	type QueryClient,
	queryOptions,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "#/lib/navigation";
import { useCallback } from "react";
import { queryKeys } from "#/lib/query-keys";

export type SessionData = NonNullable<
	Awaited<ReturnType<typeof authClient.getSession>>["data"]
>;

export function sessionQueryOptions() {
	return queryOptions({
		queryKey: queryKeys.auth.session(),
		queryFn: async (): Promise<SessionData | null> => {
			// Better Auth client needs an absolute baseURL or a browser origin.
			// Node `fetch` rejects relative URLs → "Failed to parse URL from /api/auth/...".
			// Do not return null here: dehydrating a fake unauthenticated session would
			// bounce signed-in users to /login on hydrate.
			if (typeof window === "undefined") {
				throw new Error(
					"sessionQuery is browser-only (auth client has no absolute baseURL on SSR)",
				);
			}
			const { data, error } = await authClient.getSession();
			if (error) {
				throw new Error(error.message || "Failed to load session");
			}
			return data ?? null;
		},
	});
}

export function useSessionQuery() {
	return useQuery({
		...sessionQueryOptions(),
		// Skip on the server — no absolute auth baseURL without NEXT_PUBLIC_URL.
		enabled: typeof window !== "undefined",
	});
}

/** Call after sign-in / sign-out so session cache stays correct. */
export function useInvalidateSession() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.auth.session() });
}

/**
 * Drop cached session (and all other queries) after a successful sign-out.
 *
 * Required because the dashboard uses a 30s React Query `staleTime`. Without
 * this, `/login`'s `useRedirectIfAuthenticated` still sees a cached session and
 * immediately sends the user back into the app.
 */
export function clearClientAuthState(queryClient: QueryClient) {
	// Explicit null so any in-flight subscribers treat the user as signed out
	// before the rest of the cache is wiped.
	queryClient.setQueryData(queryKeys.auth.session(), null);
	queryClient.clear();
}

/**
 * Sign out via Better Auth, wipe the client cache, then go to login.
 * Shared by the user menu and command palette.
 */
export async function signOutAndClearSession(
	queryClient: QueryClient,
	navigate: (opts: {
		to: "/login";
		search: { inviteId: undefined };
	}) => unknown,
) {
	await authClient.signOut();
	clearClientAuthState(queryClient);
	await navigate({ to: "/login", search: { inviteId: undefined } });
}

export function useSignOut() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useCallback(
		() => signOutAndClearSession(queryClient, navigate),
		[queryClient, navigate],
	);
}
