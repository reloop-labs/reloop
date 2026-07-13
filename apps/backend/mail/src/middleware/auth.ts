import { validateApiKey } from "@reloop/auth/apikey/validate";
import {
	createAuthPlugin,
	resolveSession,
	SESSION_CACHE_REDIS_PREFIX,
	type AuthContext,
} from "@reloop/auth/middleware";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { mailConfig } from "../mail.config";

if (mailConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	mailConfig.REDIS_URL,
);

export type MailAuthContext = AuthContext & {
	/** Present when authenticated via API key (used for Kumo inject path). */
	apiKeyId?: string;
};

/**
 * Batch A migration: shared plugin macros + mail-specific `auth` that also
 * accepts the internal service secret (session/API-key inject path).
 *
 * Note: we re-declare `auth` after the shared plugin so the send-email route
 * keeps `auth: true` while gaining internal-secret support.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: mailConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	)
	.macro({
		/**
		 * Fail-closed org auth: API key → internal secret → session.
		 * Returns canonical AuthContext fields (+ optional apiKeyId).
		 */
		auth: {
			async resolve({ status, request: { headers } }) {
				const apiKey = headers.get("x-api-key");
				if (apiKey) {
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
				}

				const internalSecret = headers.get("x-internal-secret");
				const organizationId = headers.get("x-organization-id");
				if (
					internalSecret &&
					organizationId &&
					mailConfig.RELOOP_INTERNAL_SECRET &&
					internalSecret === mailConfig.RELOOP_INTERNAL_SECRET
				) {
					return {
						userId: "internal",
						organizationId,
						role: null as string | null,
						authType: "session" as const,
					};
				}

				const session = await resolveSession(headers.get("cookie"), {
					baseUrl: mailConfig.BASE_URL,
					redis: sessionRedis,
					ttl: 5,
					requireOrg: true,
				});
				if (session?.organizationId) {
					return {
						userId: session.userId,
						organizationId: session.organizationId,
						role: session.role,
						authType: session.authType,
					};
				}

				return status(401, { message: "Authentication required" });
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
