import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { globalSearchController } from "./search.controllers";

export const searchRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/search",
		async ({ query }) =>
			globalSearchController({
				q: query.q ?? "",
				limit: query.limit,
			}),
		{
			authAdmin: true,
			query: t.Object({
				q: t.Optional(t.String()),
				limit: t.Optional(t.Numeric({ default: 8, minimum: 1, maximum: 20 })),
			}),
			response: {
				200: AdminModel.searchResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Global search across users, organizations, and domains",
			},
		},
	);
