import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { CreditsModel } from "../../../model/credits.model";
import { getUsageController } from "./get-usage.controllers";

export const getUsageRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/usage",
		async ({ activeOrganizationId }) => {
			return await getUsageController({ activeOrganizationId });
		},
		{
			cookieAuth: true,
			response: CreditsModel.usageResponse,
			detail: {
				summary: "Get usage summary",
				description:
					"Returns full usage snapshot for the authenticated user's active organization",
			},
		},
	);

