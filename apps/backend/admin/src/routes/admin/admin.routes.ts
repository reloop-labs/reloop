import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { auditRoute } from "@reloop/admin/routes/admin/audit/audit.route";
import { creditsRoute } from "@reloop/admin/routes/admin/credits/credits.route";
import { domainsRoute } from "@reloop/admin/routes/admin/domains/domains.route";
import { emailsRoute } from "@reloop/admin/routes/admin/emails/emails.route";
import { organizationsRoute } from "@reloop/admin/routes/admin/organizations/organizations.route";
import { overviewRoute } from "@reloop/admin/routes/admin/overview/overview.route";
import { signupInvitesRoute } from "@reloop/admin/routes/admin/signup-invites/signup-invites.route";
import { supportRoute } from "@reloop/admin/routes/admin/support/support.route";
import { Elysia } from "elysia";

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
	.use(signupInvitesRoute)
	.use(auditRoute)
	.use(supportRoute);
