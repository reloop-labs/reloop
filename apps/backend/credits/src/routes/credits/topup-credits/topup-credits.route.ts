import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { topupCreditsController } from "./topup-credits.controllers";

export const topupCreditsRoute = new Elysia().use(authMiddleware).post(
	"/topup",
	async ({ body, userId }) => {
		const { organizationId, amount, reason } = body;
		return await topupCreditsController({
			organizationId,
			amount,
			reason,
			actorUserId: userId,
		});
	},
	{
		authAdmin: true,
		body: CreditsModel.topupBody,
		response: {
			200: CreditsModel.topupResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Credits"],
			summary: "Manual credit top-up (admin)",
			description:
				"Manually credit or top-up an organization's balance. Requires platform admin privileges.",
		},
	},
);
