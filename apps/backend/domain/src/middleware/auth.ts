import { domainConfig } from "@be/domain/domain.config";
import { errorCodes } from "@be/domain/domain.error-code";
import type { Session } from "@reloop/auth/server";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

if (domainConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
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
				const traceId = crypto.randomUUID();
				const currentLogger = logger.child({ traceId, service: "domain" });

				if (session) {
					if (!session?.user?.activeOrganizationId) {
						return status(401, {
							message: "User is not a member of an organization",
							code: errorCodes.NOT_MEMBER_OF_ORGANIZATION,
						});
					}
					currentLogger.info(
						{ userId: session.user.id, organizationId: session.user.activeOrganizationId },
						"Session authentication successful",
					);
					return {
						userId: session.user.id,
						activeOrganizationId: session.user.activeOrganizationId,
						user: session.user,
						session: session.session,
						authMethod: "cookie" as const,
						traceId,
						logger: currentLogger,
					};
				}
				return status(401, {
					message: "Authentication required",
					statusCodeText: "Unauthorized",
					errorCode: errorCodes.UNAUTHORIZED,
				});
			} catch (error) {
				logger.error(
					{
						error: error instanceof Error ? error.message : "Unknown error",
					},
					"Authentication error",
				);
				return status(401, {
					message: "Authentication failed",
					errorCode: errorCodes.UNAUTHORIZED,
				});
			}
		},
	},
});
