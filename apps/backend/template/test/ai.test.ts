import { describe, expect, test } from "bun:test";
import { createAIStream } from "@be/template/routes/template/ai/ai.controllers";
import { aiRoute } from "@be/template/routes/template/ai/ai.route";
import { Elysia, sse, t } from "elysia";

const testApp = new Elysia({ name: "reloop-auth-middleware" })
	.macro({
		auth: {
			resolve() {
				return {
					userId: "test-user-id",
					organizationId: "test-org-id",
					authType: "session" as const,
				};
			},
		},
	})
	.post(
		"/ai",
		async function* ({ body }) {
			const { prompt, system, model, mode = "sse-text" } = body;

			const stream = createAIStream({
				prompt,
				system,
				model,
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
		},
	);

describe("AI Template Endpoint Integration", () => {
	test("aiRoute export is defined", () => {
		expect(aiRoute).toBeDefined();
	});

	test("POST /ai with default sse-text mode returns event stream", async () => {
		const response = await testApp.handle(
			new Request("http://localhost/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: "Create a welcome email template for new users",
				}),
			}),
		);

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain("Generated with AI");
	});

	test("POST /ai with text-stream mode returns response", async () => {
		const response = await testApp.handle(
			new Request("http://localhost/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: "Generate subject line options",
					mode: "text-stream",
				}),
			}),
		);

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain("Generated with AI");
	});

	test("POST /ai with manual-sse mode streams data and done event", async () => {
		const response = await testApp.handle(
			new Request("http://localhost/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					prompt: "Write a password reset template",
					mode: "manual-sse",
				}),
			}),
		);

		expect(response.status).toBe(200);
		const text = await response.text();
		expect(text).toContain("event: message");
		expect(text).toContain("event: done");
	});

	test("POST /ai with invalid body returns 422 validation error", async () => {
		const response = await testApp.handle(
			new Request("http://localhost/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					// Missing required prompt
				}),
			}),
		);

		expect(response.status).toBe(422);
	});
});
