import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { CreditsModel } from "../../../model/credits.model";
import { getPlanController } from "./get-plan.controllers";

export const getPlanRoute = new Elysia().use(authMiddleware).get(
	"/plan",
	async ({ activeOrganizationId }) => {
		return await getPlanController({ activeOrganizationId });
	},
	{
		cookieAuth: true,
		response: CreditsModel.planResponse,
		detail: { summary: "Get plan & subscription info" },
	},
);
