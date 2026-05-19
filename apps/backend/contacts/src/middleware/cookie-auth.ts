import { createHash } from "node:crypto";
import { contactsConfig } from "@be/contacts/contacts.config";
import { redis } from "@be/contacts/utils/loader";

/** How long (seconds) a validated session result is cached in Redis. */
const SESSION_CACHE_TTL = 30;

type SessionResult = {
	userId: string;
	organizationId: string;
	authType: "auth";
};

/**
 * Validates a session cookie, with Redis caching to avoid an HTTP
 * round-trip to the auth service on every request.
 *
 * The cookie string is SHA-256 hashed before being used as a cache key
 * so the raw credential is never stored in Redis.
 */
export async function validateSession(
	cookie: string | null,
): Promise<SessionResult | null> {
	if (!cookie) return null;

	// Build a safe, fixed-length cache key from the cookie value.
	const cookieHash = createHash("sha256").update(cookie).digest("hex");
	const cacheKey = `session:${cookieHash}`;

	// --- Cache hit: RedisCache.get<T> already handles JSON.parse internally ---
	const cached = await redis.get<SessionResult>(cacheKey);
	if (cached) {
		return cached;
	}

	// --- Cache miss: call auth service ---
	const response = await fetch(
		`${contactsConfig.BASE_URL}/api/auth/v1/get-session`,
		{
			method: "GET",
			headers: new Headers({
				"Content-Type": "application/json",
				Cookie: cookie,
			}),
		},
	);

	const session = (await response.json()) as {
		user?: {
			id: string;
			activeOrganizationId?: string;
		};
	};

	if (session?.user?.activeOrganizationId) {
		const result: SessionResult = {
			userId: session.user.id,
			organizationId: session.user.activeOrganizationId,
			authType: "auth",
		};
		// Store in Redis; ignore errors so auth is never blocked by a cache failure.
		// RedisCache.set() handles JSON.stringify internally.
		await redis.set(cacheKey, result, SESSION_CACHE_TTL).catch(() => null);
		return result;
	}

	return null;
}
