import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { listAuditController } from "./audit.controllers";

export const auditRoute = new Elysia().use(authMiddleware).get(
	"/audit",
	async ({ query }) =>
		listAuditController({
			limit: query.limit,
			offset: query.offset,
		}),
	{
		platformAdmin: true,
		query: t.Object({
			limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
			offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
		}),
		response: {
			200: AdminModel.auditResponse,
			401: AdminModel.unauthorized,
		},
		detail: {
			tags: ["Admin"],
			summary: "List platform admin audit log",
		},
	},
);
