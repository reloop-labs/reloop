import { audienceConfig } from "@be/audience/audience.config";
import { errorCodes } from "@be/audience/utils/audience.error-code";
import type { Session } from "@reloop/auth/server";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

if (audienceConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "better-auth" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const response = await fetch(
					`${audienceConfig.BASE_URL}/api/auth/v1/get-session`,
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
					if (!session?.user?.activeOrganizationId) {
						return status(401, {
							message: "User is not a member of an organization",
							code: errorCodes.NOT_MEMBER_OF_ORGANIZATION,
						});
					}
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
