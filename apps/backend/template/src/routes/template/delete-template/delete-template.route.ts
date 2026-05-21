import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { deleteTemplate } from "./delete-template.controllers";

export const deleteTemplateRoute = new Elysia().use(authMiddleware).delete(
	"/:id",
	async ({ params, organizationId }) => {
		const { id } = params;

		const result = await deleteTemplate({
			id,
			organizationId,
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
			summary: "Delete template",
			description: "Soft deletes a template",
		},
	},
);
