import { bimiCheckRoute } from "@be/tools/routes/tools/bimi-check/bimi-check.route";
import { blocklistCheckRoute } from "@be/tools/routes/tools/blocklist-check/blocklist-check.route";
import { deliverabilityTestRoute } from "@be/tools/routes/tools/deliverability-test/deliverability-test.route";
import { emailHealthCheckRoute } from "@be/tools/routes/tools/email-health-check/email-health-check.route";
import { recordGenerateRoute } from "@be/tools/routes/tools/record-generate/record-generate.route";
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
	.use(deliverabilityTestRoute)
	.use(emailHealthCheckRoute)
	.use(bimiCheckRoute)
	.use(recordGenerateRoute);
