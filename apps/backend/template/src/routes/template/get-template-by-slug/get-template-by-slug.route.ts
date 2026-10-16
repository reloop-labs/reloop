import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { Elysia, t } from "elysia";
import { getTemplateBySlug } from "./get-template-by-slug.controllers";

export const getTemplateBySlugRoute = new Elysia().use(authMiddleware).get(
	"/slug/:slug",
	async ({ params, organizationId }) => {
		return getTemplateBySlug({ slug: params.slug, organizationId });
	},
	{
		auth: true,
		params: t.Object({
			slug: t.String(),
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
			summary: "Get template by slug",
			description:
				"Retrieves a single template by its organization-unique slug",
		},
	},
);
