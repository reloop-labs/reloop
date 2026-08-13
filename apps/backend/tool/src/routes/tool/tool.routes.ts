import { checkEmailRoute } from "@be/tool/routes/tool/check-email/check-email.route";
import { Elysia } from "elysia";

export const toolRoutes = new Elysia({
	prefix: "/v1",
	name: "ToolRoutes",
}).use(checkEmailRoute);
