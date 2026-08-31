import { authCheckerRoute } from "@be/tools/routes/tools/auth-checker/auth-checker.route";
import { blocklistCheckRoute } from "@be/tools/routes/tools/blocklist-check/blocklist-check.route";
import { deliverabilityTestRoute } from "@be/tools/routes/tools/deliverability-test/deliverability-test.route";
import { dnsLookupRoute } from "@be/tools/routes/tools/dns-lookup/dns-lookup.route";
import { domainAgeRoute } from "@be/tools/routes/tools/domain-age/domain-age.route";
import { emailHealthCheckRoute } from "@be/tools/routes/tools/email-health-check/email-health-check.route";
import { spamCheckRoute } from "@be/tools/routes/tools/spam-check/spam-check.route";
import { spoofCheckerRoute } from "@be/tools/routes/tools/spoof-checker/spoof-checker.route";
import { tempEmailCheckerRoute } from "@be/tools/routes/tools/temp-email-checker/temp-email-checker.route";
import { whoSendsRoute } from "@be/tools/routes/tools/who-sends/who-sends.route";
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
	.use(dnsLookupRoute)
	.use(authCheckerRoute)
	.use(spoofCheckerRoute)
	.use(whoSendsRoute)
	.use(domainAgeRoute);




