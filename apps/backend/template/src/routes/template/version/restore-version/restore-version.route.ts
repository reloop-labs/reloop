import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { auditLogHook } from "@be/template/utils/audit-log";
import { Elysia, t } from "elysia";
import { restoreVersion } from "./restore-version.controllers";
import { restoreVersionXCodeSamples } from "./restore-version.x-codeSamples";

export const restoreVersionRoute = new Elysia().use(authMiddleware).post(
	"/:id/versions/:versionId/restore",
	async ({ params, organizationId }) => {
		const { id: templateId, versionId } = params;

		const result = await restoreVersion({
			templateId,
			versionId,
			organizationId,
		});

		return result;
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
			versionId: t.String(),
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
			tags: ["Template Versions"],
			summary: "Restore template version",
			description: "Restores a template to a specific historical version",
			"x-codeSamples": restoreVersionXCodeSamples,
		},
		afterResponse: auditLogHook({
			resourceType: "template",
			action: "restored",
		}),
	},
);
