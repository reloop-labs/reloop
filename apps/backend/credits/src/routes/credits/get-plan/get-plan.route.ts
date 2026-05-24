import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { getPlanController } from "./get-plan.controllers";

export const getPlanRoute = new Elysia().use(authMiddleware).get(
	"/plan",
	async ({ organizationId }) => {
		return await getPlanController({ organizationId });
	},
	{
		cookieAuth: true,
		response: CreditsModel.planResponse,
		detail: { summary: "Get plan & subscription info" },
	},
);
