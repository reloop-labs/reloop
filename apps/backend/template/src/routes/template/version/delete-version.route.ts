import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { deleteVersion } from "./delete-version.controllers";

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
		detail: {
			tags: ["Template Versions"],
			summary: "Delete template version",
			description:
				"Deletes a specific version of a template if it is not the active version",
		},
	},
);
