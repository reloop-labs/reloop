import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
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
