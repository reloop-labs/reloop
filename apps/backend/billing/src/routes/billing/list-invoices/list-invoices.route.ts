import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { listInvoicesController } from "./list-invoices.controllers";

export const listInvoicesRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/invoices",
		async ({ activeOrganizationId }) => {
			return await listInvoicesController({ activeOrganizationId });
		},
		{
			cookieAuth: true,
			detail: { summary: "List invoices for the authenticated org" },
		},
	);

