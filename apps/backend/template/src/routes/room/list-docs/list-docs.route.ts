import { authMiddleware } from "@be/template/middleware/auth";
import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia } from "elysia";
import { listDocsController } from "./list-docs.controllers";

export const listDocsRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.get(
		"/docs",
		async ({ organizationId, store }) => {
			return await listDocsController(store.persistence, organizationId);
		},
		{
			auth: true,
			detail: {
				tags: ["Rooms"],
				summary: "List room documents",
				description:
					"Lists all persistent documents/state records for the rooms",
			},
		},
	);
