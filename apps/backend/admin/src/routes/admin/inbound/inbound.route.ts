import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import {
	getInboundEmailController,
	listInboundEmailsController,
} from "./inbound.controllers";

export const inboundRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/inbound",
		async ({ query }) =>
			listInboundEmailsController({
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				status: query.status,
				organizationId: query.organizationId,
			}),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				status: t.Optional(t.String()),
				organizationId: t.Optional(t.String()),
			}),
			response: {
				200: AdminModel.inboundEmailsResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List inbound emails across organizations",
			},
		},
	)
	.get(
		"/inbound/:emailId",
		async ({ params: { emailId } }) => getInboundEmailController(emailId),
		{
			authAdmin: true,
			params: t.Object({
				emailId: t.String(),
			}),
			response: {
				200: AdminModel.inboundEmailDetail,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "Get a single inbound email with body and headers",
			},
		},
	);
