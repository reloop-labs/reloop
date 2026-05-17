import { Elysia } from "elysia";
import { validateSession } from "./cookie-auth";

export const authMiddleware = new Elysia({
	name: "billing-auth-middleware",
}).macro({
	cookieAuth: {
		async resolve({ request: { headers } }) {
			const cookie = headers.get("cookie");
			const session = await validateSession(cookie);
			if (!session) {
				throw new Error("Unauthorized");
			}
			return {
				userId: session.userId,
				activeOrganizationId: session.activeOrganizationId,
			};
		},
	},
});
