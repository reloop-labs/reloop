import {
	createAuthPlugin,
	createSessionCacheRedis,
	resolveApiKeyInternalOrSession,
	type AuthContext,
} from "@reloop/auth/middleware";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";
import { mailConfig } from "../mail.config";

if (mailConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = createSessionCacheRedis(mailConfig.REDIS_URL, 5);

export type MailAuthContext = AuthContext;

/**
 * Shared plugin + mail composer for `auth`:
 * API key → internal (secret + user + org) → session. Fail-closed org.
 */
export const authMiddleware = new Elysia({ name: "auth-middleware" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: mailConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
			internalSecret: mailConfig.RELOOP_INTERNAL_SECRET,
		}),
	)
	.macro({
		/**
		 * Overrides shared `auth` with the mail credential chain.
		 */
		auth: {
			async resolve({ status, request: { headers } }) {
				const ctx = await resolveApiKeyInternalOrSession(headers, {
					baseUrl: mailConfig.BASE_URL,
					redis: sessionRedis,
					ttl: 5,
					internalSecret: mailConfig.RELOOP_INTERNAL_SECRET,
				});
				if (!ctx?.organizationId) {
					return status(401, { message: "Authentication required" });
				}
				return {
					userId: ctx.userId,
					organizationId: ctx.organizationId,
					platformRole: ctx.platformRole,
					authType: ctx.authType,
					...(ctx.apiKeyId ? { apiKeyId: ctx.apiKeyId } : {}),
				};
			},
			detail: {
				security: [{ apiKey: [] }],
			},
		},
	});
