import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { auditLogHook } from "@be/template/utils/audit-log";
import {
	TEMPLATE_SLUG_MAX_LENGTH,
	TEMPLATE_SLUG_PATTERN,
} from "@be/template/utils/slug";
import { createTemplateXCodeSamples } from "@reloop/code-samples/template";
import { Elysia, t } from "elysia";
import { createTemplate } from "./create-template.controllers";

export const createTemplateRoute = new Elysia().use(authMiddleware).post(
	"/create",
	async ({ body, userId, organizationId }) => {
		const { name, slug, description, subject, fromEmail, replyTo, content } =
			body;

		const result = await createTemplate({
			organizationId,
			userId,
			name,
			slug,
			description,
			subject,
			fromEmail,
			replyTo,
			content,
		});

		return result;
	},
	{
		auth: true,
		body: t.Object({
			name: t.String({ minLength: 1, maxLength: 255 }),
			slug: t.Optional(
				t.String({
					maxLength: TEMPLATE_SLUG_MAX_LENGTH,
					pattern: TEMPLATE_SLUG_PATTERN,
					description:
						"Org-unique handle for sending by slug, e.g. welcome-email. Generated from the name when omitted.",
				}),
			),
			description: t.Optional(t.String()),
			subject: t.Optional(t.String({ maxLength: 500 })),
			fromEmail: t.Optional(t.String({ maxLength: 255 })),
			replyTo: t.Optional(t.String({ maxLength: 255 })),
			content: t.Optional(t.Array(t.Any())),
		}),
		response: {
			200: templateResponseSchema,
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			409: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "Create a new template",
			description: "Creates a new email template for the organization",
			"x-codeSamples": createTemplateXCodeSamples,
		},
		afterResponse: auditLogHook({
			resourceType: "template",
			action: "created",
		}),
	},
);
