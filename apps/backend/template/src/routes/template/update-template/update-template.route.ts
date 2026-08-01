import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { auditLogHook } from "@be/template/utils/audit-log";
import { updateTemplateXCodeSamples } from "@reloop/code-samples/template";
import { Elysia, t } from "elysia";
import { updateTemplate } from "./update-template.controllers";

export const updateTemplateRoute = new Elysia().use(authMiddleware).put(
	"/:id",
	async ({ params, body, organizationId }) => {
		const { id } = params;

		const result = await updateTemplate({
			id,
			organizationId,
			...body,
		});

		return result;
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
			description: t.Optional(t.String()),
			subject: t.Optional(t.String({ maxLength: 500 })),
			fromEmail: t.Optional(t.String({ maxLength: 255 })),
			replyTo: t.Optional(t.String({ maxLength: 255 })),
			previewText: t.Optional(t.String()),
			content: t.Optional(t.Array(t.Any())),
			variables: t.Optional(
				t.Array(
					t.Object({
						name: t.String(),
						type: t.Union([t.Literal("string"), t.Literal("number")]),
						defaultValue: t.Union([t.String(), t.Null()]),
					}),
				),
			),
			status: t.Optional(
				t.Union([
					t.Literal("draft"),
					t.Literal("published"),
					t.Literal("archived"),
				]),
			),
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
			summary: "Update template",
			description: "Updates template properties or draft content",
			"x-codeSamples": updateTemplateXCodeSamples,
		},
		afterResponse: auditLogHook({
			resourceType: "template",
			action: "updated",
		}),
	},
);
