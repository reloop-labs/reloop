import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth-middleware";
import { auditRoute } from "./audit/audit.route";
import { creditsRoute } from "./credits/credits.route";
import { domainsRoute } from "./domains/domains.route";
import { emailsRoute } from "./emails/emails.route";
import { organizationsRoute } from "./organizations/organizations.route";
import { overviewRoute } from "./overview/overview.route";

export const adminRoutes = new Elysia({
	prefix: "/v1",
	name: "AdminRoutes",
})
	.use(authMiddleware)
	.use(overviewRoute)
	.use(organizationsRoute)
	.use(domainsRoute)
	.use(creditsRoute)
	.use(emailsRoute)
	.use(auditRoute);
