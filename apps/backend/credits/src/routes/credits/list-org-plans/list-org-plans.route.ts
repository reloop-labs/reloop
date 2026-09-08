import { ErrorResponseSchema } from "@reloop/credits/error/credits.error-response";
import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia } from "elysia";
import { listOrgPlansController } from "./list-org-plans.controllers";

export const listOrgPlansRoute = new Elysia().use(authMiddleware).get(
	"/org-plans",
	async ({ userId }) => {
		return await listOrgPlansController({ userId });
	},
	{
		authNoOrg: true,
		response: {
			200: CreditsModel.orgPlansResponse,
			401: ErrorResponseSchema,
		},
		detail: {
			tags: ["Credits"],
			summary: "List plans for the user's organizations",
			description:
				"Returns the Reloop plan id for each organization the signed-in user belongs to.",
		},
	},
);
