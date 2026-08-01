import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { listTemplatesXCodeSamples } from "@reloop/code-samples/template";
import { Elysia, t } from "elysia";
import { listTemplates } from "./list-templates.controllers";

export const listTemplatesRoute = new Elysia().use(authMiddleware).get(
	"/list",
	async ({ query, organizationId }) => {
		const { page, limit } = query;

		const result = await listTemplates({
			organizationId,
			page: page ? Number(page) : 1,
			limit: limit ? Number(limit) : 10,
		});

		return result;
	},
	{
		auth: true,
		query: t.Object({
			page: t.Optional(t.String()),
			limit: t.Optional(t.String()),
		}),
		response: {
			200: t.Object({
				templates: t.Array(templateResponseSchema),
				total: t.Number(),
				page: t.Number(),
				limit: t.Number(),
			}),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "List templates",
			description: "Lists all templates for the organization with pagination",
			"x-codeSamples": listTemplatesXCodeSamples,
		},
	},
);
