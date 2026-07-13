import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { getUsageController } from "./get-usage.controllers";

export const getUsageRoute = new Elysia().use(authMiddleware).get(
	"/usage",
	async ({ organizationId }) => {
		return await getUsageController({ organizationId });
	},
	{
		auth: true,
		response: {
			200: CreditsModel.usageResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Credits"],
			summary: "Get usage summary",
			description:
				"Returns full usage snapshot for the authenticated user's active organization",
		},
	},
);
