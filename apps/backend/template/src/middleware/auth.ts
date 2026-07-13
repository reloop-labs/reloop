import { AuthErrors } from "@be/template/error/template.error";
import { templateConfig } from "@be/template/template.config";
import {
	createAuthPlugin,
	resolveSession,
	SESSION_CACHE_REDIS_PREFIX,
} from "@reloop/auth/middleware";
import { validateApiKey } from "@reloop/auth/apikey/validate";
import { RedisCache } from "@reloop/cache/redis-client";
import { Elysia } from "elysia";
import { evlog } from "evlog/elysia";

if (templateConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const sessionRedis = new RedisCache(
	SESSION_CACHE_REDIS_PREFIX,
	5,
	templateConfig.REDIS_URL,
);

/**
 * Batch B migration: shared plugin + collabAuth for collaboration websocket
 * (needs email/name/image from get-session for presence).
 */
export const authMiddleware = new Elysia({ name: "better-auth" })
	.use(evlog())
	.use(
		createAuthPlugin({
			baseUrl: templateConfig.BASE_URL,
			redis: sessionRedis,
			ttl: 5,
		}),
	)
	.macro({
		/**
		 * Session or API key with fail-closed org, plus optional profile fields
		 * from get-session for the collab presence channel.
		 */
		collabAuth: {
			async resolve({ request: { headers } }) {
				const apiKey = headers.get("x-api-key");
				if (apiKey) {
					const result = await validateApiKey(apiKey, sessionRedis);
					if (result?.organizationId) {
						return {
							userId: result.userId,
							organizationId: result.organizationId,
							role: null as string | null,
							authType: "apikey" as const,
							apiKeyId: result.apiKeyId,
							userEmail: undefined as string | undefined,
							userName: undefined as string | undefined,
							userImage: undefined as string | undefined,
						};
					}
				}

				const cookie = headers.get("cookie");
				if (!cookie) throw AuthErrors.unauthorized();

				// Full get-session for profile fields (email/name/image).
				const response = await fetch(
					`${templateConfig.BASE_URL.replace(/\/$/, "")}/api/auth/v1/get-session`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Cookie: cookie,
						},
					},
				);
				if (!response.ok) throw AuthErrors.unauthorized();

				const body = (await response.json()) as {
					user?: {
						id: string;
						email?: string;
						name?: string;
						image?: string;
						activeOrganizationId?: string | null;
						role?: string | null;
					};
				} | null;

				const user = body?.user;
				if (!user?.id || !user.activeOrganizationId) {
					throw AuthErrors.unauthorized();
				}

				// Populate shared session cache so subsequent `auth` hits are fast.
				await resolveSession(cookie, {
					baseUrl: templateConfig.BASE_URL,
					redis: sessionRedis,
					ttl: 5,
					requireOrg: true,
				}).catch(() => null);

				return {
					userId: user.id,
					organizationId: user.activeOrganizationId,
					role: user.role ?? null,
					authType: "session" as const,
					userEmail: user.email,
					userName: user.name,
					userImage: user.image,
				};
			},
		},
	});
