import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { domainConfig } from "@reloop/domain/domain.config";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (domainConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	domainConfig.REDIS_URL,
);

/**
 * Batch A migration: shared plugin + service-specific internal-secret macro
 * for KumoMTA dkim-key injects.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: domainConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	)
	.macro({
		/**
		 * API key or internal service secret (KumoMTA → dkim-key for
		 * already-authenticated mail-service injects).
		 */
		apiKeyOrInternalAuth: {
			async resolve({ status, request: { headers } }) {
				const apiKey = headers.get("x-api-key");
				const apiKeyResult = await validateApiKey(apiKey, sessionRedis);
				if (apiKeyResult?.organizationId) {
					return {
						userId: apiKeyResult.userId,
						organizationId: apiKeyResult.organizationId,
						role: null as string | null,
						authType: "apikey" as const,
						apiKeyId: apiKeyResult.apiKeyId,
					};
				}

				const internalSecret = headers.get("x-internal-secret");
				const organizationId = headers.get("x-organization-id");
				if (
					internalSecret &&
					organizationId &&
					domainConfig.RELOOP_INTERNAL_SECRET &&
					internalSecret === domainConfig.RELOOP_INTERNAL_SECRET
				) {
					return {
						userId: "internal",
						organizationId,
						role: null as string | null,
						authType: "session" as const,
					};
				}

				return status(401, { message: "Authentication required" });
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
