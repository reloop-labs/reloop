import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { listTransactionsController } from "./list-transactions.controllers";

export const listTransactionsRoute = new Elysia().use(authMiddleware).get(
	"/transactions",
	async ({ organizationId }) => {
		return await listTransactionsController({ organizationId });
	},
	{
		auth: true,
		response: {
			200: CreditsModel.transactionsResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Credits"],
			summary: "List credit ledger entries",
			description:
				"Retrieves the credit transactions ledger history for the authenticated user's organization",
		},
	},
);
