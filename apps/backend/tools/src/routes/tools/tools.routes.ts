import { blocklistCheckRoute } from "@be/tools/routes/tools/blocklist-check/blocklist-check.route";
import { deliverabilityTestRoute } from "@be/tools/routes/tools/deliverability-test/deliverability-test.route";
import { spamCheckRoute } from "@be/tools/routes/tools/spam-check/spam-check.route";
import { tempEmailCheckerRoute } from "@be/tools/routes/tools/temp-email-checker/temp-email-checker.route";
import { Elysia } from "elysia";

export const toolsRoutes = new Elysia({
	prefix: "/v1",
	name: "ToolsRoutes",
})
	.use(tempEmailCheckerRoute)
	.use(spamCheckRoute)
	.use(blocklistCheckRoute)
	.use(deliverabilityTestRoute);
