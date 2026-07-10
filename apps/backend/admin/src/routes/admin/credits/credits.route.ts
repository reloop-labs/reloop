import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	getCreditsController,
	topupCreditsController,
} from "./credits.controllers";

export const creditsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/credits/:organizationId",
		async ({ params }) => getCreditsController(params.organizationId),
		{
			platformAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			response: {
				200: AdminModel.creditsDetailResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Get organization credits and ledger",
			},
		},
	)
	.post(
		"/credits/topup",
		async ({ body, userId }) =>
			topupCreditsController({
				organizationId: body.organizationId,
				amount: body.amount,
				reason: body.reason,
				actorUserId: userId,
			}),
		{
			platformAdmin: true,
			body: AdminModel.topupBody,
			response: {
				200: AdminModel.topupResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Manual credit top-up",
			},
		},
	);
