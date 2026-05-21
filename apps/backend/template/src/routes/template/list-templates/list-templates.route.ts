import { authMiddleware } from "@be/template/middleware/auth";
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
		detail: {
			tags: ["Templates"],
			summary: "List templates",
			description: "Lists all templates for the organization with pagination",
		},
	},
);
