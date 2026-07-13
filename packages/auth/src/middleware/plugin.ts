import { Elysia } from "elysia";
import { validateApiKey } from "../apikey/validate";
import { PLATFORM_ADMIN_ROLE } from "../roles";
import { resolveSession } from "./session";
import {
	type AuthContext,
	type AuthMiddlewareConfig,
	type AuthRedis,
	DEFAULT_SESSION_CACHE_TTL_SECONDS,
} from "./types";

type ResolveOpts = {
	baseUrl: string;
	redis: AuthRedis;
	ttl: number;
	requireOrg: boolean;
	allowApiKey: boolean;
	requirePlatformAdmin: boolean;
};

async function resolveFromHeaders(
	headers: Headers,
	opts: ResolveOpts,
): Promise<AuthContext | null> {
	if (opts.allowApiKey) {
		const apiKey =
			headers.get("x-api-key") ||
			headers.get("authorization")?.replace(/^Bearer\s+/i, "");
		if (apiKey) {
			const result = await validateApiKey(apiKey, opts.redis);
			if (result) {
				if (opts.requireOrg && !result.organizationId) return null;
				const ctx: AuthContext = {
					userId: result.userId,
					organizationId: result.organizationId,
					role: null,
					authType: "apikey",
				};
				if (opts.requirePlatformAdmin) return null;
				return ctx;
			}
		}
	}

	const cookie = headers.get("cookie");
	const session = await resolveSession(cookie, {
		baseUrl: opts.baseUrl,
		redis: opts.redis,
		ttl: opts.ttl,
		requireOrg: opts.requireOrg && !opts.requirePlatformAdmin,
	});
	if (!session) return null;

	if (opts.requirePlatformAdmin) {
		if (session.role !== PLATFORM_ADMIN_ROLE) return null;
	}

	return session;
}

/**
 * Shared Elysia auth plugin factory.
 *
 * Inject `{ baseUrl, redis, ttl }` per service — nothing is hardcoded.
 * Registers four guard macros that all produce the canonical {@link AuthContext}.
 */
export function createAuthPlugin(config: AuthMiddlewareConfig) {
	const baseUrl = config.baseUrl;
	const redis = config.redis;
	const ttl = config.ttl ?? DEFAULT_SESSION_CACHE_TTL_SECONDS;

	const base = { baseUrl, redis, ttl };

	return new Elysia({ name: "reloop-auth-middleware" }).macro({
		/**
		 * Default guard: session or API key; fail closed without active org.
		 */
		auth: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveFromHeaders(headers, {
					...base,
					requireOrg: true,
					allowApiKey: true,
					requirePlatformAdmin: false,
				});
				if (!ctx) {
					return status(401, { message: "Authentication required" });
				}
				return ctx;
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},

		/**
		 * Session or API key; organization optional.
		 */
		authNoOrg: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveFromHeaders(headers, {
					...base,
					requireOrg: false,
					allowApiKey: true,
					requirePlatformAdmin: false,
				});
				if (!ctx) {
					return status(401, { message: "Authentication required" });
				}
				return ctx;
			},
		},

		/**
		 * API-key only. Organization comes from the key's owning org.
		 */
		apiKeyAuth: {
			async resolve({ status, request: { headers } }) {
				const apiKey =
					headers.get("x-api-key") ||
					headers.get("authorization")?.replace(/^Bearer\s+/i, "");
				const result = await validateApiKey(apiKey, redis);
				if (!result?.organizationId) {
					return status(401, { message: "Authentication required" });
				}
				const ctx: AuthContext = {
					userId: result.userId,
					organizationId: result.organizationId,
					role: null,
					authType: "apikey",
				};
				return ctx;
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},

		/**
		 * Session only; requires platform-admin role. Org optional.
		 */
		platformAdmin: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveFromHeaders(headers, {
					...base,
					requireOrg: false,
					allowApiKey: false,
					requirePlatformAdmin: true,
				});
				if (!ctx) {
					return status(401, {
						message: "Unauthorized access",
						why: "Platform admin privileges are required",
						fix: "Sign in with a platform admin account",
					});
				}
				return ctx;
			},
		},
	});
}

export type AuthPlugin = ReturnType<typeof createAuthPlugin>;
