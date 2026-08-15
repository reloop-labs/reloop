import { checkEmailRoute } from "@be/tools/routes/tools/check-email/check-email.route";
import { Elysia } from "elysia";

export const toolsRoutes = new Elysia({
	prefix: "/v1",
	name: "ToolsRoutes",
}).use(checkEmailRoute);
