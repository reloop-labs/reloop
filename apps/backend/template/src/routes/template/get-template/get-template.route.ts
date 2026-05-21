import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateResponseSchema } from "@be/template/model/template.model";
import { Elysia, t } from "elysia";
import { getTemplate } from "./get-template.controllers";

export const getTemplateRoute = new Elysia().use(authMiddleware).get(
	"/:id",
	async ({ params, organizationId }) => {
		const { id } = params;

		const result = await getTemplate({
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
			200: templateResponseSchema,
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "Get template by ID",
			description: "Retrieves a single template by its ID",
		},
	},
);
