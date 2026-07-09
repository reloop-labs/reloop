import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import {
	listDomainsController,
	updateDomainStatusController,
} from "./domains.controllers";

export const domainsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/domains",
		async ({ query }) =>
			listDomainsController({
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				status: query.status,
			}),
		{
			platformAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				status: t.Optional(
					t.Union([
						t.Literal("pending"),
						t.Literal("verifying"),
						t.Literal("active"),
						t.Literal("suspended"),
						t.Literal("failed"),
					]),
				),
			}),
			response: {
				200: AdminModel.domainsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List all domains",
			},
		},
	)
	.patch(
		"/domains/:domainId/status",
		async ({ params, body, userId }) =>
			updateDomainStatusController({
				domainId: params.domainId,
				status: body.status,
				reason: body.reason,
				actorUserId: userId,
			}),
		{
			platformAdmin: true,
			params: t.Object({ domainId: t.String() }),
			body: AdminModel.updateDomainStatusBody,
			response: {
				200: AdminModel.successResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Update domain status",
			},
		},
	);
