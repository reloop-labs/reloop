import { authMiddleware } from "@be/template/middleware/auth";
import type { YjsPersistence } from "@be/template/utils/persistence";
import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia } from "elysia";
import { listDocsController } from "./list-docs.controllers";

export const listDocsRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.get(
		"/docs",
		async ({ user, store }) => {
			return await listDocsController(
				store.persistence,
				user.activeOrganizationId,
			);
		},
		{
			auth: true,
		},
	);
