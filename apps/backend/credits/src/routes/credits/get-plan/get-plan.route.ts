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
		auth: true,
		response: {
			200: CreditsModel.planResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Credits"],
			summary: "Get plan & subscription info",
			description:
				"Returns the active plan and subscription details for the authenticated user's organization",
		},
	},
);
