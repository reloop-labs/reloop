import { Elysia } from "elysia";
import { authMiddleware } from "../../middleware/auth-middleware";
import { getPlanRoute } from "./get-plan/get-plan.route";
import { getUsageRoute } from "./get-usage/get-usage.route";
import { listInvoicesRoute } from "./list-invoices/list-invoices.route";
import { listTransactionsRoute } from "./list-transactions/list-transactions.route";
import { topupCreditsRoute } from "./topup-credits/topup-credits.route";

export const creditsRoutes = new Elysia({
	prefix: "/v1",
	name: "CreditsRoutes",
})
	.use(authMiddleware)
	.use(getUsageRoute)
	.use(getPlanRoute)
	.use(listInvoicesRoute)
	.use(listTransactionsRoute)
	.use(topupCreditsRoute);
