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
		response: {
			200: CreditsModel.topupResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Credits"],
			summary: "Manual credit top-up (admin)",
			description:
				"Manually credit or top-up an organization's balance. Requires admin privileges.",
		},
	},
);
