// ─── Shared constants ────────────────────────────────────────────────────────
export const TEST_API_KEY = "test-api-key";
export const TEST_USER_ID = "user_test_123";
export const TEST_ORG_ID = "org_test_123";
export const TEST_KEY_ID = "api_key_test123";
export const AUTH_HEADERS = { "x-api-key": TEST_API_KEY };

/**
 * Eden Treaty always requires both `headers` and `query` in the options object.
 * Use these helpers instead of passing them inline.
 */
export const withAuth = { headers: AUTH_HEADERS, query: {} } as const;
export const noAuth = { headers: {}, query: {} } as const;

// ─── Factory: DB user row ─────────────────────────────────────────────────────
export function makeUser(overrides: Partial<ReturnType<typeof makeUser>> = {}) {
	return {
		id: TEST_USER_ID,
		name: "Test User",
		email: "test@example.com",
		image: null as string | null,
		...overrides,
	};
}

// ─── Factory: full apikey DB row ──────────────────────────────────────────────
export function makeApiKeyRow(overrides: Record<string, unknown> = {}) {
	const now = new Date();
	return {
		id: TEST_KEY_ID,
		name: "Test Key",
		start: "rl_live_",
		prefix: "rl",
		key: "hashed_key",
		organizationId: TEST_ORG_ID,
		userId: TEST_USER_ID,
		refillInterval: null as number | null,
		refillAmount: null as number | null,
		lastRefillAt: null as Date | null,
		enabled: true,
		rateLimitEnabled: true,
		rateLimitTimeWindow: 1000,
		rateLimitMax: 100,
		requestCount: 0,
		remaining: 100 as number | null,
		lastRequest: null as Date | null,
		expiresAt: null as Date | null,
		createdAt: now,
		updatedAt: now,
		permissions: null as string | null,
		metadata: null as string | null,
		...overrides,
	};
}

// ─── Factory: apikey row with user relation (used in findFirst/findMany) ──────
export function makeApiKeyWithUser(
	keyOverrides: Record<string, unknown> = {},
	userOverrides: Record<string, unknown> = {},
) {
	return {
		...makeApiKeyRow(keyOverrides),
		user: makeUser(userOverrides),
	};
}
