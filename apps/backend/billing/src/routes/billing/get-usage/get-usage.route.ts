import { Elysia } from "elysia";
import { BillingModel } from "../../../model/billing.model";
import { getUsageController } from "./get-usage.controllers";

export const getUsageRoute = new Elysia().get(
	"/usage",
	async ({ activeOrganizationId }) => {
		return await getUsageController({ activeOrganizationId });
	},
	{
		cookieAuth: true,
		response: BillingModel.usageResponse,
		detail: {
			summary: "Get usage summary",
			description:
				"Returns full usage snapshot for the authenticated user's active organization",
		},
	},
);
