import type { Session } from "@reloop/auth/server";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";
import { mailConfig } from "../mail.config";

if (process.env.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "better-auth" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const response = await fetch(
					`${mailConfig.BASE_URL}/api/auth/v1/get-session`,
					{
						method: "GET",
						headers: new Headers({
							"Content-Type": "application/json",
							Cookie: headers.get("cookie") || "",
						}),
					},
				);
				const session: Session | null = await response.json();
				const traceId = crypto.randomUUID();
				const tenantLogger = logger.child({ traceId, service: "mail" });

				if (session) {
					tenantLogger.info(
						{ userId: session.user },
						"User authenticated via cookie",
					);
					return {
						user: session.user,
						session: session.session,
						authMethod: "cookie" as const,
						traceId,
						logger: tenantLogger,
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
