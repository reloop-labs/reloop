import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { listEmailsController } from "./emails.controllers";

export const emailsRoute = new Elysia().use(authMiddleware).get(
	"/emails",
	async ({ query }) =>
		listEmailsController({
			limit: query.limit,
			offset: query.offset,
			q: query.q,
			status: query.status,
			organizationId: query.organizationId,
		}),
	{
		platformAdmin: true,
		query: t.Object({
			limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
			offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
			q: t.Optional(t.String()),
			status: t.Optional(t.String()),
			organizationId: t.Optional(t.String()),
		}),
		response: {
			200: AdminModel.emailsResponse,
			401: AdminModel.unauthorized,
		},
		detail: {
			tags: ["Admin"],
			summary: "List email logs across organizations",
		},
	},
);
