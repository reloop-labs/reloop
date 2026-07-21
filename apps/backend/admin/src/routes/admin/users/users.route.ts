import { authMiddleware } from "@reloop/admin/middleware/auth-middleware";
import { AdminModel } from "@reloop/admin/model/admin.model";
import { Elysia, t } from "elysia";
import { getUserController } from "./users.controllers";

export const usersRoute = new Elysia()
	.use(authMiddleware)
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
	);
