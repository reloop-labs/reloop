import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { htmlToImageXCodeSamples } from "@reloop/code-samples/template";
import { Elysia, t } from "elysia";
import { htmlToImage } from "./html-to-image.controllers";

export const htmlToImageRoute = new Elysia().use(authMiddleware).post(
	"/html-to-image",
	async ({ body }) => {
		const result = await htmlToImage({
			html: body.html,
			width: body.width,
			format: body.format,
			quality: body.quality,
			scale: body.scale,
		});

		return new Response(result.bytes, {
			headers: {
				"Content-Type": result.contentType,
				"Cache-Control": "no-store",
				"Content-Disposition": `inline; filename="template.${result.format}"`,
			},
		});
	},
	{
		auth: true,
		body: t.Object({
			html: t.String({ minLength: 1 }),
			width: t.Optional(t.Number({ minimum: 200, maximum: 2000 })),
			format: t.Optional(
				t.Union([t.Literal("png"), t.Literal("jpeg"), t.Literal("webp")]),
			),
			quality: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
			scale: t.Optional(t.Number({ minimum: 1, maximum: 3 })),
		}),
		response: {
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates"],
			summary: "Convert HTML to an image",
			description:
				"Renders email HTML in a headless browser and returns a PNG, JPEG, or WebP of the full document. Use this to generate template thumbnails from saved `renderedHtml`.",
			"x-codeSamples": htmlToImageXCodeSamples,
		},
	},
);
