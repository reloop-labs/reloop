import { tempEmailCheckerRoute } from "@be/tools/routes/tools/temp-email-checker/temp-email-checker.route";
import { spamCheckRoute } from "@be/tools/routes/tools/spam-check/spam-check.route";
import { Elysia } from "elysia";

export const toolsRoutes = new Elysia({
	prefix: "/v1",
	name: "ToolsRoutes",
})
	.use(tempEmailCheckerRoute)
	.use(spamCheckRoute);
