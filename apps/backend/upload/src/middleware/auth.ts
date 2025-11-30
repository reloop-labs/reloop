import { uploadConfig } from "@be/upload/upload.config";
import { errorCodes } from "@be/upload/upload.error-code";
import type { Session } from "@reloop/auth/server";
import { logger } from "@reloop/logger";
import { Elysia } from "elysia";

if (uploadConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "better-auth" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const response = await fetch(
					`${uploadConfig.BASE_URL}/api/auth/v1/get-session`,
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
					return {
						user: session.user,
						session: session.session,
						authMethod: "cookie" as const,
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
