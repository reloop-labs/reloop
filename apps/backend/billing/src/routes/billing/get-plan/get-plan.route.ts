import { Elysia } from "elysia";
import { BillingModel } from "../../../model/billing.model";
import { getPlanController } from "./get-plan.controllers";

export const getPlanRoute = new Elysia().get(
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
