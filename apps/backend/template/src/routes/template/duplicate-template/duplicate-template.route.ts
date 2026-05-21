import { authMiddleware } from "@be/template/middleware/auth";
import { persistencePlugin } from "@be/template/utils/persistence";
import { Elysia, t } from "elysia";
import { duplicateTemplate } from "./duplicate-template.controllers";

export const duplicateTemplateRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.post(
		"/:id/duplicate",
		async ({ params, user, store }) => {
			const { id: userId, activeOrganizationId: organizationId } = user;
			const { id } = params;

			const result = await duplicateTemplate({
				id,
				organizationId,
				userId,
				persistence: store.persistence,
			});

			return result;
		},
		{
			auth: true,
			params: t.Object({
				id: t.String(),
			}),
			detail: {
				tags: ["Templates"],
				summary: "Duplicate template",
				description: "Creates a copy of an existing template",
			},
		},
	);
