import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { Elysia } from "elysia";
import { getPlanRoute } from "./get-plan/get-plan.route";
import { getUsageRoute } from "./get-usage/get-usage.route";
import { listTransactionsRoute } from "./list-transactions/list-transactions.route";
import { topupCreditsRoute } from "./topup-credits/topup-credits.route";

export const creditsRoutes = new Elysia({
	prefix: "/v1",
	name: "CreditsRoutes",
})
	.use(authMiddleware)
	.use(getUsageRoute)
	.use(getPlanRoute)
	.use(listTransactionsRoute)
	.use(topupCreditsRoute);
