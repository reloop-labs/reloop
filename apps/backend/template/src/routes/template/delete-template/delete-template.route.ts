import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { auditLogHook } from "@be/template/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteTemplate } from "./delete-template.controllers";
import { deleteTemplateXCodeSamples } from "@reloop/code-samples/template";

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
		response: {
			200: t.Object({
				success: t.Boolean(),
				id: t.Optional(t.String()),
			}),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "Delete template",
			description: "Soft deletes a template",
			"x-codeSamples": deleteTemplateXCodeSamples,
		},
		afterResponse: auditLogHook({
			resourceType: "template",
			action: "deleted",
		}),
	},
);
