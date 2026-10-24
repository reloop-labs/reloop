import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { createCreditsCheckoutController } from "./credits-checkout.controllers";

export const creditsCheckoutRoute = new Elysia().use(authMiddleware).post(
	"/credits/checkout",
	async ({ organizationId, body }) => {
		return await createCreditsCheckoutController({
			organizationId,
			emails: body.emails,
		});
	},
	{
		authSession: true,
		body: CreditsModel.creditsCheckoutBody,
		response: {
			200: CreditsModel.checkoutResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Billing"],
			summary: "Buy email credits",
			description:
				"Starts a one-time Polar checkout for a pay-as-you-go email credit pack.",
		},
	},
);
