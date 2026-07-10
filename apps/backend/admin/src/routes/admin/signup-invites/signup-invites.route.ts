import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	createSignupInviteController,
	listSignupInvitesController,
	revokeSignupInviteController,
} from "./signup-invites.controllers";

export const signupInvitesRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/signup-invites",
		async ({ query }) =>
			listSignupInvitesController({
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
						t.Literal("used"),
						t.Literal("revoked"),
					]),
				),
			}),
			response: {
				200: AdminModel.signupInvitesResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List platform signup invites",
			},
		},
	)
	.post(
		"/signup-invites",
		async ({ body, userId }) =>
			createSignupInviteController({
				email: body.email,
				actorUserId: userId,
			}),
		{
			platformAdmin: true,
			body: AdminModel.createSignupInviteBody,
			response: {
				200: AdminModel.signupInviteCreatedResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Create a platform signup invite",
			},
		},
	)
	.post(
		"/signup-invites/:inviteId/revoke",
		async ({ params, userId }) =>
			revokeSignupInviteController({
				inviteId: params.inviteId,
				actorUserId: userId,
			}),
		{
			platformAdmin: true,
			params: t.Object({ inviteId: t.String() }),
			response: {
				200: AdminModel.signupInviteRevokeResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Revoke a pending signup invite",
			},
		},
	);
