import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { templateConfig } from "../../../template.config";

export interface AIStreamInput {
	prompt: string;
	system?: string;
	model?: string;
	apiKey?: string;
}

/** Default system prompt tuned for TipTap / React Email editor HTML. */
export const DEFAULT_TEMPLATE_AI_SYSTEM = `You are an expert email designer for Reloop's React Email editor (TipTap).

Generate a complete, production-ready HTML email body that the editor can load with setContent.

Rules:
- Output ONLY raw HTML — no markdown fences, no commentary.
- Prefer table-based layout with inline CSS (email-client safe).
- Use semantic tags TipTap understands well: p, h1, h2, h3, strong, em, a, ul, ol, li, img, hr, blockquote.
- Include a clear visual hierarchy, readable copy, and one primary CTA button (styled <a>).
- Keep width ~560–600px, mobile-friendly.
- Use {{variable_name}} placeholders where personalization helps (e.g. {{first_name}}).
- Do not wrap the document in explanations — start with <!DOCTYPE html> or a root <table>/<div>.`;

type AIStreamHandle = {
	textStream: AsyncIterable<string>;
	toTextStreamResponse: () => Response;
	toUIMessageStreamResponse: () => Response;
};

function isGemmaModel(model: string) {
	const m = model.toLowerCase();
	return (
		m.includes("gemma") ||
		m.startsWith("ollama:") ||
		m === templateConfig.GEMMA_MODEL.toLowerCase()
	);
}

function isGeminiModel(model: string) {
	return model.toLowerCase().includes("gemini");
}

function plainTextStreamResponse(stream: ReadableStream<Uint8Array>) {
	return new Response(stream, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "no-cache",
			"X-Content-Type-Options": "nosniff",
		},
	});
}

function asyncIterableFromReadableStream(
	stream: ReadableStream<Uint8Array>,
): AsyncIterable<string> {
	const decoder = new TextDecoder();
	return {
		async *[Symbol.asyncIterator]() {
			const reader = stream.getReader();
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					if (value) yield decoder.decode(value, { stream: true });
				}
				const tail = decoder.decode();
				if (tail) yield tail;
			} finally {
				reader.releaseLock();
			}
		},
	};
}

function handleFromByteStream(
	stream: ReadableStream<Uint8Array>,
): AIStreamHandle {
	const textStream = asyncIterableFromReadableStream(stream);
	return {
		textStream,
		toTextStreamResponse: () => plainTextStreamResponse(stream),
		toUIMessageStreamResponse: () =>
			new Response(stream, {
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
				},
			}),
	};
}

function handleFromStringChunks(
	chunks: string[],
	delayMs = 12,
): AIStreamHandle {
	const encoder = new TextEncoder();
	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
			controller.close();
		},
	});
	return handleFromByteStream(stream);
}

function buildOllamaPrompt(system: string, prompt: string) {
	return `${system}\n\nUser request:\n${prompt}`;
}

/** Stream Ollama /api/generate NDJSON into a plain-text byte stream. */
async function streamGemmaOllama(
	fullPrompt: string,
	model: string,
): Promise<ReadableStream<Uint8Array> | null> {
	try {
		const baseUrl = templateConfig.OLLAMA_BASE_URL.replace(/\/$/, "");
		const modelName = model.startsWith("ollama:")
			? model.slice("ollama:".length)
			: model || templateConfig.GEMMA_MODEL;

		const res = await fetch(`${baseUrl}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: modelName,
				prompt: fullPrompt,
				stream: true,
				options: { temperature: 0.4 },
			}),
		});
		if (!res.ok || !res.body) return null;

		const encoder = new TextEncoder();
		const decoder = new TextDecoder();
		const reader = res.body.getReader();
		let buffer = "";

		return new ReadableStream<Uint8Array>({
			async pull(controller) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) {
						controller.close();
						return;
					}
					buffer += decoder.decode(value, { stream: true });
					const lines = buffer.split("\n");
					buffer = lines.pop() ?? "";
					let enqueued = false;
					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed) continue;
						try {
							const parsed = JSON.parse(trimmed) as {
								response?: string;
								done?: boolean;
							};
							if (parsed.response) {
								controller.enqueue(encoder.encode(parsed.response));
								enqueued = true;
							}
							if (parsed.done) {
								controller.close();
								return;
							}
						} catch {
							// skip malformed NDJSON lines
						}
					}
					if (enqueued) return;
				}
			},
			cancel() {
				void reader.cancel();
			},
		});
	} catch {
		return null;
	}
}

function mockTemplateHtml(prompt: string) {
	const safe = prompt.replace(/</g, "&lt;");
	return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b; margin: 0; padding: 40px 20px;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; border: 1px solid #e4e4e7; padding: 32px;">
    <tr>
      <td>
        <h1 style="color: #09090b; font-size: 24px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Generated with AI</h1>
        <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">Here is your custom email template generated for: <strong>"${safe}"</strong>.</p>
        <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin-bottom: 28px;">Hi {{first_name}}, welcome — we're excited to help you get started.</p>
        <a href="https://reloop.dev" style="display: inline-block; background-color: #18181b; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px;">Get Started Now &rarr;</a>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Create an AI text stream for email template HTML.
 * Ladder: Gemma/Ollama (default) → Gemini → OpenAI → mock HTML.
 */
export async function createAIStream({
	prompt,
	system = DEFAULT_TEMPLATE_AI_SYSTEM,
	model = templateConfig.GEMMA_MODEL,
	apiKey,
}: AIStreamInput): Promise<AIStreamHandle> {
	const resolvedModel = model || templateConfig.GEMMA_MODEL;

	if (isGemmaModel(resolvedModel)) {
		const ollamaStream = await streamGemmaOllama(
			buildOllamaPrompt(system, prompt),
			resolvedModel,
		);
		if (ollamaStream) return handleFromByteStream(ollamaStream);
	}

	const geminiApiKey =
		apiKey ||
		process.env.GEMINI_API_KEY ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;

	if (isGeminiModel(resolvedModel) && geminiApiKey) {
		const googleProvider = apiKey
			? createGoogleGenerativeAI({ apiKey: geminiApiKey })
			: google;
		const result = streamText({
			model: googleProvider(resolvedModel),
			system,
			prompt,
		});
		return {
			textStream: result.textStream,
			toTextStreamResponse: () => result.toTextStreamResponse(),
			toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
		};
	}

	if (
		!isGemmaModel(resolvedModel) &&
		!isGeminiModel(resolvedModel) &&
		openaiApiKey
	) {
		const openaiProvider = apiKey
			? createOpenAI({ apiKey: openaiApiKey })
			: openai;
		const result = streamText({
			model: openaiProvider(resolvedModel),
			system,
			prompt,
		});
		return {
			textStream: result.textStream,
			toTextStreamResponse: () => result.toTextStreamResponse(),
			toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
		};
	}

	if (!isGemmaModel(resolvedModel)) {
		const ollamaStream = await streamGemmaOllama(
			buildOllamaPrompt(system, prompt),
			templateConfig.GEMMA_MODEL,
		);
		if (ollamaStream) return handleFromByteStream(ollamaStream);
	}

	const mockHtml = mockTemplateHtml(prompt);
	const mockChunks = mockHtml.match(/.{1,80}/g) || [mockHtml];
	return handleFromStringChunks(mockChunks);
}
