import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { auditLogHook } from "@be/template/utils/audit-log";
import { persistencePlugin } from "@be/template/utils/persistence";
import { duplicateTemplateXCodeSamples } from "@reloop/code-samples/template";
import { Elysia, t } from "elysia";
import { duplicateTemplate } from "./duplicate-template.controllers";

export const duplicateTemplateRoute = new Elysia()
	.use(authMiddleware)
	.use(persistencePlugin)
	.post(
		"/:id/duplicate",
		async ({ params, userId, organizationId, store }) => {
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
				summary: "Duplicate template",
				description: "Creates a copy of an existing template",
				"x-codeSamples": duplicateTemplateXCodeSamples,
			},
			afterResponse: auditLogHook({
				resourceType: "template",
				action: "duplicated",
			}),
		},
	);
