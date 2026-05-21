import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { getTemplate } from "./get-template.controllers";

export const getTemplateRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params, organizationId }) => {
		const { id } = params;

		const result = await getTemplate({
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
			summary: "Get template by ID",
			description: "Retrieves a single template by its ID",
		},
	},
);
