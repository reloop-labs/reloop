import { describe, expect, mock, test } from "bun:test";
import { fetchGetSession } from "@reloop/auth/middleware/session/fetch-get-session";

describe("fetchGetSession", () => {
	test("prefers session.activeOrganizationId over user.activeOrganizationId", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify({
					user: {
						id: "u1",
						role: "user",
						email: "u@example.com",
						name: "User",
						activeOrganizationId: "user-org",
					},
					session: {
						activeOrganizationId: "session-org",
					},
				}),
				{ status: 200 },
			);
		}) as typeof fetch;

		try {
			const result = await fetchGetSession(
				"reloop.session_token=tok",
				"http://auth",
			);
			expect(result).toEqual({
				id: "u1",
				role: "user",
				email: "u@example.com",
				name: "User",
				image: undefined,
				activeOrganizationId: "session-org",
			});
		} finally {
			globalThis.fetch = originalFetch;
		}
	});

	test("ignores user.activeOrganizationId when the session has no active org", async () => {
		const originalFetch = globalThis.fetch;
		globalThis.fetch = mock(async () => {
			return new Response(
				JSON.stringify({
					user: {
						id: "u1",
						role: "user",
						email: "u@example.com",
						name: "User",
						activeOrganizationId: "user-org",
					},
				}),
				{ status: 200 },
			);
		}) as typeof fetch;

		try {
			const result = await fetchGetSession(
				"reloop.session_token=tok",
				"http://auth",
			);
			expect(result?.activeOrganizationId).toBeNull();
		} finally {
			globalThis.fetch = originalFetch;
		}
	});
});
