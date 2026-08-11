import { checkEmailRoute } from "@be/validation/routes/validation/check-email/check-email.route";
import { Elysia } from "elysia";

export const validationRoutes = new Elysia({
	prefix: "/v1",
	name: "ValidationRoutes",
}).use(checkEmailRoute);
