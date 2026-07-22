import { ErrorResponseSchema } from "@be/template/error/template.error";
import { authMiddleware } from "@be/template/middleware/auth";
import { Elysia, sse, t } from "elysia";
import { createAIStream } from "./ai.controllers";

export const aiRoute = new Elysia().use(authMiddleware).post(
	"/ai",
	async function* ({ body }) {
		const { prompt, system, model, apiKey, mode = "sse-text" } = body;

		const stream = createAIStream({
			prompt,
			system,
			model,
			apiKey,
		});

		switch (mode) {
			case "text-stream":
				return stream.textStream;

			case "ui-message-stream":
				return stream.toUIMessageStream();

			case "sse-text":
				return sse(stream.textStream);

			case "sse-ui":
				return sse(stream.toUIMessageStream());

			case "text-response":
				return stream.toTextStreamResponse();

			case "ui-message-response":
				return stream.toUIMessageStreamResponse();

			case "manual-sse":
				for await (const data of stream.textStream) {
					yield sse({
						data,
						event: "message",
					});
				}
				yield sse({
					event: "done",
				});
				return;

			default:
				return sse(stream.textStream);
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
