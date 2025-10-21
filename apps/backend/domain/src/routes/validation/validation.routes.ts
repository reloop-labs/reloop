import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth";
import { validateDnsRoute } from "./routes/validate-dns.route";

export const validationRoutes = new Elysia({
    prefix: "/validation",
    name: "ValidationRoutes",
})
    .use(authMiddleware)
    .use(validateDnsRoute);
