import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { listVersions } from "./list-versions.controllers";

export const listVersionsRoute = new Elysia().use(authMiddleware).get(
	"/:id/versions",
	async ({ params, organizationId }) => {
		const { id: templateId } = params;

		const result = await listVersions({
			templateId,
			organizationId,
		});

		return result;
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		detail: {
			tags: ["Template Versions"],
			summary: "List template versions",
			description:
				"Returns all saved versions for a template, ordered newest first",
		},
	},
);
