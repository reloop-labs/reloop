import { Elysia } from "elysia";
import { patchOrgPlanRoute } from "./admin/patch-plan.route";
import { checkoutRoute } from "./checkout/checkout.route";
import { periodsRoute } from "./invoices/periods.route";
import { portalRoute } from "./subscription/portal.route";

export const billingRoutes = new Elysia({
	prefix: "/v1/billing",
	name: "BillingRoutes",
})
	.use(checkoutRoute)
	.use(portalRoute)
	.use(periodsRoute)
	.use(patchOrgPlanRoute);
