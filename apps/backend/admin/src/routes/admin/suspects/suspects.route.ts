import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { listSuspectsController } from "./suspects.controllers";

export const suspectsRoute = new Elysia()
	.use(authMiddleware)
	.get(
		"/suspects",
		async ({ query }) =>
			listSuspectsController({
				limit: query.limit,
				offset: query.offset,
				q: query.q,
				type: query.type,
				severity: query.severity,
				category: query.category,
			}),
		{
			authAdmin: true,
			query: t.Object({
				limit: t.Optional(t.Numeric({ default: 50, minimum: 1, maximum: 200 })),
				offset: t.Optional(t.Numeric({ default: 0, minimum: 0 })),
				q: t.Optional(t.String()),
				type: t.Optional(
					t.Union([
						t.Literal("all"),
						t.Literal("user"),
						t.Literal("organization"),
					]),
				),
				severity: t.Optional(
					t.Union([
						t.Literal("low"),
						t.Literal("medium"),
						t.Literal("high"),
						t.Literal("critical"),
					]),
				),
				category: t.Optional(
					t.Union([
						t.Literal("spam"),
						t.Literal("phishing"),
						t.Literal("fraud"),
						t.Literal("abuse"),
						t.Literal("other"),
					]),
				),
			}),
			response: {
				200: AdminModel.suspectsListResponse,
				401: AdminModel.unauthorized,
			},
			detail: {
				tags: ["Admin"],
				summary: "List all suspected spam/scam users and organizations",
			},
		},
	);
