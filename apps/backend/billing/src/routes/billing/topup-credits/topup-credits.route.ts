import { Elysia, t } from "elysia";
import { BillingModel } from "../../../model/billing.model";
import { topupCreditsController } from "./topup-credits.controllers";

export const topupCreditsRoute = new Elysia().post(
	"/topup",
	async ({ body }) => {
		const { organizationId, amount, reason } = body;
		return await topupCreditsController({ organizationId, amount, reason });
	},
	{
		body: BillingModel.topupBody,
		detail: { summary: "Manual credit top-up (admin)" },
	},
);
