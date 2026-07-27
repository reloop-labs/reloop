import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { templateVersionResponseSchema } from "@be/template/model/template.model";
import { Elysia, t } from "elysia";
import { listVersions } from "./list-versions.controllers";
import { listVersionsXCodeSamples } from "@reloop/code-samples/template";

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
		response: {
			200: t.Array(templateVersionResponseSchema),
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],

			summary: "List Template",
			description:
				"Returns all saved versions for a template, ordered newest first",
			"x-codeSamples": listVersionsXCodeSamples,
		},
	},
);
