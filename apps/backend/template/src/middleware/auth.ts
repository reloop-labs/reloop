import { log } from "evlog";
import { templateConfig } from "@be/template/template.config";
import { TEMPLATE_ERROR_CODES } from "@be/template/template.error-code";
import type { Session } from "@reloop/auth/server";

import { Elysia } from "elysia";

if (templateConfig.NODE_ENV !== "production") {
	process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export const authMiddleware = new Elysia({ name: "better-auth" }).macro({
	auth: {
		async resolve({ status, request: { headers } }) {
			try {
				const response = await fetch(
					`${templateConfig.BASE_URL}/api/auth/v1/get-session`,
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
							code: TEMPLATE_ERROR_CODES.UNAUTHORIZED,
						});
					}
					return {
						user: session.user,
						session: session.session,
						authMethod: "cookie" as const,
					};
				}
				return status(401, {
					message: "Authentication required",
					statusCodeText: "Unauthorized",
					errorCode: TEMPLATE_ERROR_CODES.UNAUTHORIZED,
				});
			} catch (error) {
				log.error({ ...({
						error: error instanceof Error ? error.message : "Unknown error",
					}), message: "Authentication error" });
				return status(401, {
					message: "Authentication failed",
					errorCode: TEMPLATE_ERROR_CODES.UNAUTHORIZED,
				});
			}
		},
	},
});
