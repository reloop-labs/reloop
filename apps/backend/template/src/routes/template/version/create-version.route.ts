import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { createVersion } from "./create-version.controllers";

export const createVersionRoute = new Elysia().use(authMiddleware).post(
	"/:id/versions",
	async ({ params, body, user }) => {
		const { id: userId, activeOrganizationId: organizationId } = user;
		const { id: templateId } = params;
		const { content, subject, description, name, isMajor, renderedHtml } = body;

		const result = await createVersion({
			templateId,
			organizationId,
			userId,
			content,
			subject,
			description,
			name,
			isMajor,
			renderedHtml,
		});

		return result;
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			content: t.Array(t.Any()),
			subject: t.Optional(t.String({ maxLength: 500 })),
			description: t.Optional(t.String({ maxLength: 500 })),
			name: t.Optional(t.String({ maxLength: 255 })),
			isMajor: t.Optional(t.Boolean()),
			renderedHtml: t.Optional(t.String()),
		}),
		detail: {
			tags: ["Template Versions"],
			summary: "Create a new template version",
			description:
				"Saves a snapshot of the current template content as a new version",
		},
	},
);
