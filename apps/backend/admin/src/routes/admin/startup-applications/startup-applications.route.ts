import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { StartupApplicationModel } from "@reloop/admin/model/startup-application.model";
import { Elysia, t } from "elysia";
import {
	getStartupApplicationController,
	listStartupApplicationsController,
	updateStartupApplicationController,
} from "../../landing/startup-application.controllers";

export const startupApplicationsAdminRoute = new Elysia({
	prefix: "/startup-applications",
})
	.use(authMiddleware)
	.get(
		"",
		async ({ query }) =>
			listStartupApplicationsController({
				limit: query.limit,
				offset: query.offset,
				status: query.status,
				q: query.q,
			}),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				status: t.Optional(t.String()),
				q: t.Optional(t.String()),
			}),
			response: {
				200: StartupApplicationModel.listResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List startup program applications",
			},
		},
	)
	.get(
		"/:id",
		async ({ params }) => getStartupApplicationController(params.id),
		{
			authAdmin: true,
			params: t.Object({ id: t.String() }),
			response: {
				200: StartupApplicationModel.item,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Get a startup program application",
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body }) =>
			updateStartupApplicationController(params.id, {
				status: body.status,
				reviewNote: body.reviewNote,
			}),
		{
			authAdmin: true,
			params: t.Object({ id: t.String() }),
			body: StartupApplicationModel.updateBody,
			response: {
				200: StartupApplicationModel.item,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Review a startup program application",
			},
		},
	);
