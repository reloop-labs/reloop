import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	getUserController,
	listUsersController,
	updateUserSuspectController,
} from "./users.controllers";

export const usersRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/users",
		async ({ query }) =>
			listUsersController({
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				searchField: query.searchField,
				role: query.role,
				status: query.status,
				isSuspect: query.isSuspect,
				sortBy: query.sortBy,
				sortDirection: query.sortDirection,
			}),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				searchField: t.Optional(t.String()),
				role: t.Optional(t.String()),
				status: t.Optional(t.String()),
				isSuspect: t.Optional(t.Boolean()),
				sortBy: t.Optional(t.String()),
				sortDirection: t.Optional(
					t.Union([t.Literal("asc"), t.Literal("desc")]),
				),
			}),
			response: {
				200: AdminModel.adminUsersResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List platform users with suspect status",
			},
		},
	)
	.get(
		"/users/:userId",
		async ({ params }) => getUserController(params.userId),
		{
			authAdmin: true,
			params: t.Object({ userId: t.String() }),
			response: {
				200: AdminModel.userDetail,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Get platform user hub detail",
			},
		},
	)
	.patch(
		"/users/:userId/suspect",
		async ({ params, body, userId }) =>
			updateUserSuspectController({
				userId: params.userId,
				isSuspect: body.isSuspect,
				reason: body.reason,
				severity: body.severity,
				category: body.category,
				flagOrganizations: body.flagOrganizations,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ userId: t.String() }),
			body: AdminModel.updateSuspectBody,
			response: {
				200: AdminModel.successResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Update user suspect / spam status",
			},
		},
	);
