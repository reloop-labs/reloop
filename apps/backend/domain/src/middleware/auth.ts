import { domainConfig } from "@be/domain/domain.config";
import type { Session } from "@reloop/auth/server";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

if (domainConfig.NODE_ENV !== "production") {
	domainConfig.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "better-auth" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const response = await fetch(
					`${domainConfig.BASE_URL}/api/auth/v1/get-session`,
					{
						method: "GET",
						headers: new Headers({
							"Content-Type": "application/json",
							Cookie: headers.get("cookie") || "",
						}),
					},
				);
				const session: Session | null = await response.json();
				if (session) {
					logger.info(
						{ userId: session.user },
						"User authenticated via cookie",
					);
					return {
						user: session.user,
						session: session.session,
						authMethod: "cookie" as const,
					};
				}
				return status(401, { message: "Authentication required" });
			} catch (error) {
				logger.error(
					{
						error: error instanceof Error ? error.message : "Unknown error",
					},
					"Authentication error",
				);
				return status(401, { message: "Authentication failed" });
			}
		},
	},
});
