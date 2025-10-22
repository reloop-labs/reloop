import { authMiddleware } from "@reloop/domain/middleware/auth";
import { validateDnsRoute } from "@reloop/domain/routes/validation/routes/validate-dns.route";
import { Elysia } from "elysia";

export const validationRoutes = new Elysia({
	prefix: "/validation",
	name: "ValidationRoutes",
})
	.use(authMiddleware)
	.use(validateDnsRoute);
