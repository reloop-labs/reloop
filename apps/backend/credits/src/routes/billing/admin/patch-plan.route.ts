import { authMiddleware } from "@reloop/credits/middleware/auth-middleware";
import { CreditsModel } from "@reloop/credits/model/credits.model";
import { Elysia, t } from "elysia";
import { patchOrgPlanController } from "./patch-plan.controllers";

export const patchOrgPlanRoute = new Elysia().use(authMiddleware).patch(
	"/admin/organizations/:organizationId/plan",
	async ({ params, body }) => {
		return await patchOrgPlanController({
			organizationId: params.organizationId,
			patch: body,
		});
	},
	{
		authAdmin: true,
		params: t.Object({
			organizationId: t.String(),
		}),
		body: CreditsModel.adminPlanPatchBody,
		response: {
			200: CreditsModel.adminPlanPatchResponse,
			401: CreditsModel.unauthorized,
		},
		detail: {
			tags: ["Billing"],
			summary: "Edit an organization's lifetime plan",
			description:
				"Grant extra inboxes, webhooks, or included emails for one organization. Changes persist until edited again.",
		},
	},
);
