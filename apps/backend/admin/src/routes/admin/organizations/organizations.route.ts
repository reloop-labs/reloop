import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import {
	getOrganizationController,
	listOrganizationsController,
	updateOrganizationStatusController,
} from "./organizations.controllers";

export const organizationsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/organizations",
		async ({ query }) =>
			listOrganizationsController({
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
						t.Literal("active"),
						t.Literal("suspended"),
						t.Literal("deleted"),
					]),
				),
			}),
			response: {
				200: AdminModel.organizationsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List all organizations",
			},
		},
	)
	.get(
		"/organizations/:organizationId",
		async ({ params }) => getOrganizationController(params.organizationId),
		{
			platformAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			response: {
				200: AdminModel.organizationDetail,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Get organization detail",
			},
		},
	)
	.patch(
		"/organizations/:organizationId/status",
		async ({ params, body, userId }) =>
			updateOrganizationStatusController({
				organizationId: params.organizationId,
				status: body.status,
				reason: body.reason,
				actorUserId: userId,
			}),
		{
			platformAdmin: true,
			params: t.Object({ organizationId: t.String() }),
			body: AdminModel.updateOrgStatusBody,
			response: {
				200: AdminModel.successResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Update organization status",
			},
		},
	);
