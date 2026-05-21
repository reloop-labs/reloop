import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateVersionResponseSchema } from "@be/template/model/template.model";
import { auditLogHook } from "@be/template/utils/audit-log";
import { Elysia, t } from "elysia";
import { deleteVersion } from "./delete-version.controllers";
import { deleteVersionXCodeSamples } from "./delete-version.x-codeSamples";

export const deleteVersionRoute = new Elysia().use(authMiddleware).delete(
	"/:id/versions/:versionId",
	async ({ params, organizationId }) => {
		const { id: templateId, versionId } = params;

		const result = await deleteVersion({
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
			200: templateVersionResponseSchema,
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],

			summary: "Delete template version",
			description:
				"Deletes a specific version of a template if it is not the active version",
			"x-codeSamples": deleteVersionXCodeSamples,
		},
		afterResponse: auditLogHook({
			resourceType: "template_version",
			action: "deleted",
		}),
	},
);
