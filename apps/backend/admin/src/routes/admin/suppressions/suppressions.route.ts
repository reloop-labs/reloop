import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	listSuppressionsController,
	removeSuppressionController,
} from "./suppressions.controllers";

export const suppressionsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/suppressions",
		async ({ query }) =>
			listSuppressionsController({
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				reason: query.reason,
			}),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				reason: t.Optional(
					t.Union([
						t.Literal("hard_bounce"),
						t.Literal("spam_complaint"),
						t.Literal("mailbox_full"),
						t.Literal("blocked"),
					]),
				),
			}),
			response: {
				200: AdminModel.suppressionsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List suppressed contacts across all organizations",
			},
		},
	)
	.post(
		"/suppressions/:contactId/remove",
		async ({ params, userId }) =>
			removeSuppressionController({
				contactId: params.contactId,
				actorUserId: userId,
			}),
		{
			authAdmin: true,
			params: t.Object({ contactId: t.String() }),
			response: {
				200: AdminModel.removeSuppressionResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary:
					"Remove an address from the suppression list in every organization",
			},
		},
	);
