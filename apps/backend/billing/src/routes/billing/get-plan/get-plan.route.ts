import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { BillingModel } from "../../../model/billing.model";
import { getPlanController } from "./get-plan.controllers";

export const getPlanRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/plan",
		async ({ activeOrganizationId }) => {
			return await getPlanController({ activeOrganizationId });
		},
		{
			cookieAuth: true,
			response: BillingModel.planResponse,
			detail: { summary: "Get plan & subscription info" },
		},
	);

