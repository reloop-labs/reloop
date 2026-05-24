import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia, t } from "elysia";
import { topupCreditsController } from "./topup-credits.controllers";

export const topupCreditsRoute = new Elysia().post(
	"/topup",
	async ({ body }) => {
		const { organizationId, amount, reason } = body;
		return await topupCreditsController({ organizationId, amount, reason });
	},
	{
		body: CreditsModel.topupBody,
		detail: { summary: "Manual credit top-up (admin)" },
	},
);
