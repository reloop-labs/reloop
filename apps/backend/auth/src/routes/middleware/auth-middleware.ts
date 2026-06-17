import { db } from "@reloop/db/client";
import { Elysia } from "elysia";
import { auth } from "../../lib/auth";

/**
 * Resolves the active organization ID from the session.
 * Attaches `organizationId` and `userId` to the request context.
 */
export const authMiddleware = new Elysia({ name: "AuthMiddleware" }).derive(
	{ as: "scoped" },
	async ({ request, set }) => {
		const session = await auth.api.getSession({ headers: request.headers });

		if (!session) {
			set.status = 401;
			throw new Error("Unauthorized");
		}

		const organizationId =
			session.user.activeOrganizationId ??
			(session.session as any)?.activeOrganizationId ??
			"";

		if (!organizationId) {
			set.status = 400;
			throw new Error("No active organization");
		}

		return {
			userId: session.user.id,
			organizationId,
		};
	},
);
