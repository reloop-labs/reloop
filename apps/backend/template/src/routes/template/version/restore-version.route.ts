import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { restoreVersion } from "./restore-version.controllers";

export const restoreVersionRoute = new Elysia().use(authMiddleware).post(
	"/:id/versions/:versionId/restore",
	async ({ params, user }) => {
		const { activeOrganizationId: organizationId } = user;
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
		detail: {
			tags: ["Template Versions"],
			summary: "Restore template version",
			description: "Restores a template to a specific historical version",
		},
	}
);
