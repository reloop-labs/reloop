import { authMiddleware } from "@be/template/middleware/auth";
import { getTemplate } from "@be/template/routes/template/controllers";
import { Elysia, t } from "elysia";

export const getTemplateRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params, user }) => {
		const { activeOrganizationId: organizationId } = user;
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
