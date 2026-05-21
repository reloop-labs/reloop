import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { Elysia, t } from "elysia";
import { createTemplate } from "./create-template.controllers";
import { createTemplateXCodeSamples } from "./create-template.x-codeSamples";

export const createTemplateRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, userId, organizationId }) => {
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
		response: {
			200: templateResponseSchema,
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "Create a new template",
			description: "Creates a new email template for the organization",
			"x-codeSamples": createTemplateXCodeSamples,
		},
	},
);
