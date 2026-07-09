import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia } from "elysia";
import { authMiddleware } from "../../../middleware/auth-middleware";
import { getOverviewController } from "./overview.controllers";

export const overviewRoute = new Elysia().use(authMiddleware).get(
	"/overview",
	async () => getOverviewController(),
	{
		platformAdmin: true,
		response: {
			200: AdminModel.overviewResponse,
			401: AdminModel.unauthorized,
		},
		detail: {
			tags: ["Admin"],
			summary: "Platform overview KPIs",
		},
	},
);
