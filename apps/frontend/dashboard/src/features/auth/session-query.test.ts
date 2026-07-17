import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { queryKeys } from "#/lib/query-keys";

const signOutMock = vi.fn();

vi.mock("@reloop/auth/client", () => ({
	authClient: {
		signOut: (...args: unknown[]) => signOutMock(...args),
		getSession: vi.fn(),
	},
}));

import {
	clearClientAuthState,
	signOutAndClearSession,
} from "./session-query";

const mockSession = {
	user: { id: "user_1", email: "dev@reloop.sh", name: "Dev" },
	session: { id: "sess_1", token: "tok" },
};

function seedAuthenticatedCache(queryClient: QueryClient) {
	queryClient.setQueryData(queryKeys.auth.session(), mockSession);
	queryClient.setQueryData(queryKeys.auth.organizations(), [
		{ id: "org_1", name: "Acme" },
	]);
}

describe("logout session cache", () => {
	beforeEach(() => {
		signOutMock.mockReset();
		signOutMock.mockResolvedValue({ data: { success: true }, error: null });
	});

	/**
	 * Characterization of the bug: after signOut + navigate only, React Query
	 * still holds the session for up to staleTime (30s). Login then treats the
	 * user as authenticated and redirects them back into the app.
	 */
	test("sign-out without clearing cache leaves session (bug repro)", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: 30_000 } },
		});
		seedAuthenticatedCache(queryClient);

		// Broken path used by user-dropdown / command-menu before the fix:
		await signOutMock();
		// navigate to /login — cache untouched

		const cachedSession = queryClient.getQueryData(queryKeys.auth.session());
		const wouldRedirectIfAuthenticated = Boolean(cachedSession);

		expect(cachedSession).toEqual(mockSession);
		expect(wouldRedirectIfAuthenticated).toBe(true);
	});

	test("clearClientAuthState removes session so login will not redirect", () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: 30_000 } },
		});
		seedAuthenticatedCache(queryClient);

		clearClientAuthState(queryClient);

		expect(queryClient.getQueryData(queryKeys.auth.session())).toBeUndefined();
		expect(
			queryClient.getQueryData(queryKeys.auth.organizations()),
		).toBeUndefined();
		expect(Boolean(queryClient.getQueryData(queryKeys.auth.session()))).toBe(
			false,
		);
	});

	test("signOutAndClearSession signs out, clears cache, then navigates", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { staleTime: 30_000 } },
		});
		seedAuthenticatedCache(queryClient);
		const navigate = vi.fn().mockResolvedValue(undefined);

		await signOutAndClearSession(queryClient, navigate);

		expect(signOutMock).toHaveBeenCalledOnce();
		expect(queryClient.getQueryData(queryKeys.auth.session())).toBeUndefined();
		expect(navigate).toHaveBeenCalledWith({
			to: "/login",
			search: { inviteId: undefined },
		});
		// Order: API sign-out first, then navigate (cache already empty)
		expect(signOutMock.mock.invocationCallOrder[0]).toBeLessThan(
			navigate.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
		);
	});
});
