import { Elysia } from "elysia";
import { listTransactionsController } from "./list-transactions.controllers";

export const listTransactionsRoute = new Elysia().get(
	"/transactions",
	async ({ activeOrganizationId }) => {
		return await listTransactionsController({ activeOrganizationId });
	},
	{
		cookieAuth: true,
		detail: { summary: "List credit ledger entries for the authenticated org" },
	},
);
