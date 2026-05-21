import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateVersionResponseSchema } from "@be/template/model/template.model";
import { auditLogHook } from "@be/template/utils/audit-log";
import { Elysia, t } from "elysia";
import { createVersion } from "./create-version.controllers";
import { createVersionXCodeSamples } from "./create-version.x-codeSamples";

export const createVersionRoute = new Elysia().use(authMiddleware).post(
	"/:id/versions",
	async ({ params, body, userId, organizationId }) => {
		const { id: templateId } = params;
		const {
			content,
			subject,
			fromEmail,
			replyTo,
			previewText,
			description,
			name,
			isMajor,
			renderedHtml,
		} = body;

		const result = await createVersion({
			templateId,
			organizationId,
			userId,
			content,
			subject,
			fromEmail,
			replyTo,
			previewText,
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
			fromEmail: t.Optional(t.String({ maxLength: 255 })),
			replyTo: t.Optional(t.String({ maxLength: 255 })),
			previewText: t.Optional(t.String()),
			description: t.Optional(t.String({ maxLength: 500 })),
			name: t.Optional(t.String({ maxLength: 255 })),
			isMajor: t.Optional(t.Boolean()),
			renderedHtml: t.Optional(t.String()),
		}),
		response: {
			200: t.Composite([
				templateVersionResponseSchema,
				t.Object({
					draftNumber: t.Optional(t.Number()),
					publishNumber: t.Optional(t.Number()),
				}),
			]),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Template Versions"],
			summary: "Create a new template version",
			description:
				"Saves a snapshot of the current template content as a new version",
			"x-codeSamples": createVersionXCodeSamples,
		},
		afterResponse: auditLogHook({
			resourceType: "template_version",
			action: "created",
		}),
	},
);
