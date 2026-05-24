import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { Elysia } from "elysia";
import { listTransactionsController } from "./list-transactions.controllers";

export const listTransactionsRoute = new Elysia().use(authMiddleware).get(
	"/transactions",
	async ({ activeOrganizationId }) => {
		return await listTransactionsController({ activeOrganizationId });
	},
	{
		cookieAuth: true,
		detail: { summary: "List credit ledger entries for the authenticated org" },
	},
);
