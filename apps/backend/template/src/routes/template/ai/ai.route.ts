import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, t } from "elysia";
import { createAIStream } from "./ai.controllers";

export const aiRoute = new Elysia().use(authMiddleware).post(
	"/ai",
	async ({ body }) => {
		const { prompt, system, model, apiKey, mode = "sse-text" } = body;

		const stream = createAIStream({
			prompt,
			system,
			model,
			apiKey,
		});

		switch (mode) {
			case "text-stream":
			case "text-response":
				// Return a proper streaming Response with text/plain content type.
				// Elysia passes through Response objects directly.
				return stream.toTextStreamResponse();

			case "ui-message-stream":
			case "ui-message-response":
				return stream.toUIMessageStreamResponse();

			case "sse-text":
			case "sse-ui":
			default:
				// For SSE modes, pipe the text stream as a text/event-stream Response.
				return new Response(
					new ReadableStream({
						async start(controller) {
							const encoder = new TextEncoder();
							for await (const chunk of stream.textStream) {
								controller.enqueue(
									encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
								);
							}
							controller.enqueue(encoder.encode("data: [DONE]\n\n"));
							controller.close();
						},
					}),
					{
						headers: {
							"Content-Type": "text/event-stream",
							"Cache-Control": "no-cache",
							Connection: "keep-alive",
						},
					},
				);
		}
	},
	{
		auth: true,
		body: t.Object({
			prompt: t.String({ minLength: 1 }),
			system: t.Optional(t.String()),
			model: t.Optional(t.String()),
			apiKey: t.Optional(t.String()),
			mode: t.Optional(
				t.Union([
					t.Literal("text-stream"),
					t.Literal("ui-message-stream"),
					t.Literal("sse-text"),
					t.Literal("sse-ui"),
					t.Literal("text-response"),
					t.Literal("ui-message-response"),
					t.Literal("manual-sse"),
				]),
			),
		}),
		response: {
			400: ErrorResponseSchema,
			401: ErrorResponseSchema,
			403: ErrorResponseSchema,
			500: ErrorResponseSchema,
		},
		detail: {
			tags: ["Templates", "AI"],
			summary: "Generate AI email template stream",
			description:
				"Streams AI responses using Vercel AI SDK and Elysia's streaming and SSE integration.",
		},
	},
);
