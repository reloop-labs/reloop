import { authMiddleware } from "@be/template/middleware/auth";
import { createTemplate } from "@be/template/routes/template/controllers";
import { Elysia, t } from "elysia";

export const createTemplateRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, user }) => {
		const { id: userId, activeOrganizationId: organizationId } = user;
		const { name, description, subject, content } = body;

		const result = await createTemplate({
			organizationId,
			userId,
			name,
			description,
			subject,
			content,
		});

		return result;
	},
	{
		auth: true,
		body: t.Object({
			name: t.String({ minLength: 1, maxLength: 255 }),
			description: t.Optional(t.String()),
			subject: t.Optional(t.String({ maxLength: 500 })),
			content: t.Optional(t.Array(t.Any())),
		}),
		detail: {
			tags: ["Templates"],
			summary: "Create a new template",
			description: "Creates a new email template for the organization",
		},
	},
);
