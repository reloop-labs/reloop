import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	blockOrgForSpamController,
	checkSpamController,
	getOrgSpamRiskController,
	listSpamRiskController,
	unblockOrgController,
} from "./spam.controllers";

export const spamRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/spam/organizations",
		async ({ query }) =>
			listSpamRiskController({ limit: query.limit, minLevel: query.minLevel }),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				minLevel: t.Optional(AdminModel.riskLevel),
			}),
			response: {
				200: AdminModel.spamRiskListResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Riskiest active organizations by spam-risk score",
			},
		},
	)
	.get(
		"/spam/organizations/:organizationId",
		async ({ params }) => getOrgSpamRiskController(params.organizationId),
		{
			authAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			response: {
				200: AdminModel.spamRiskReport,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Spam-risk report for one organization",
			},
		},
	)
	.post(
		"/spam/organizations/:organizationId/block",
		async ({ params, body, userId }) =>
			blockOrgForSpamController({
				organizationId: params.organizationId,
				reason: body.reason,
				banUsers: body.banUsers,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			body: AdminModel.spamBlockBody,
			response: {
				200: AdminModel.spamBlockResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Suspend an organization for spam (stops API + SMTP sending)",
			},
		},
	)
	.post(
		"/spam/organizations/:organizationId/unblock",
		async ({ params, body, userId }) =>
			unblockOrgController({
				organizationId: params.organizationId,
				reason: body.reason,
				unbanUsers: body.unbanUsers,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			body: AdminModel.spamUnblockBody,
			response: {
				200: AdminModel.spamUnblockResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Reactivate an organization and release reputation pauses",
			},
		},
	)
	.post("/spam/check", async ({ body }) => checkSpamController(body), {
		authAdmin: true,
		body: AdminModel.spamCheckBody,
		response: {
			200: AdminModel.spamCheckResponse,
			401: AdminModel.unauthorized,
		},
		detail: {
			tags: ["Admin"],
			summary: "Score a message with the outbound spam check (no send)",
		},
	});
