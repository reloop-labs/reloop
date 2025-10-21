import { Elysia } from "elysia";
import { authMiddleware } from "@reloop/domain/middleware/auth";
import { validateDnsRoute } from "@reloop/domain/routes/validation/routes/validate-dns.route";

export const validationRoutes = new Elysia({
    prefix: "/validation",
    name: "ValidationRoutes",
})
    .use(authMiddleware)
    .use(validateDnsRoute);
