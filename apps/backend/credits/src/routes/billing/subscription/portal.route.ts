import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { createPortalController } from "./portal.controllers";

export const portalRoute = new Elysia().use(authMiddleware).post(
	"/portal",
	async ({ organizationId }) => {
		return await createPortalController({ organizationId });
	},
	{
		authSession: true,
		response: {
			200: CreditsModel.portalResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Billing"],
			summary: "Open Polar customer portal",
			description:
				"Creates a Polar customer portal session for invoices and payment methods.",
		},
	},
);
