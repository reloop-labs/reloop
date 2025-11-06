import { authMiddleware } from "@be/domain/middleware/auth";
import { validateDnsRoute } from "@be/domain/routes/validation/routes/validate-dns.route";
import { Elysia } from "elysia";

export const validationRoutes = new Elysia({
	prefix: "/validation",
	name: "ValidationRoutes",
})
	.use(authMiddleware)
	.use(validateDnsRoute);
