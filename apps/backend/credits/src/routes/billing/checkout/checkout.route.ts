import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { createCheckoutController } from "./checkout.controllers";

export const checkoutRoute = new Elysia().use(authMiddleware).post(
	"/checkout",
	async ({ organizationId, body }) => {
		return await createCheckoutController({
			organizationId,
			planId: body.planId,
		});
	},
	{
		authSession: true,
		body: CreditsModel.checkoutBody,
		response: {
			200: CreditsModel.checkoutResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Billing"],
			summary: "Create Polar checkout",
			description:
				"Starts Polar checkout for Individual or Startup on the active organization.",
		},
	},
);
