import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { getTemplateThumbnail } from "./get-thumbnail.controllers";

export const getThumbnailRoute = new Elysia().use(authMiddleware).get(
	"/:id/thumbnail",
	async ({ params, organizationId }) => {
		const result = await getTemplateThumbnail({
			templateId: params.id,
			organizationId,
		});

		if (result.url && result.bytes.byteLength === 0) {
			return Response.redirect(result.url, 302);
		}

		return new Response(result.bytes, {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": result.url
					? "public, max-age=300"
					: "private, no-store",
			},
		});
	},
	{
		auth: true,
		params: t.Object({
			id: t.String(),
		}),
		response: {
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			404: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "Get template thumbnail",
			description:
				"Returns a PNG preview of the latest saved template HTML. Generates and stores the image on first request.",
		},
	},
);
