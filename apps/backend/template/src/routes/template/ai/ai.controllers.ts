import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import { templateConfig } from "../../../template.config";

export type AIImageInput = {
	url: string;
	mime?: string;
};

export interface AIStreamInput {
	prompt: string;
	system?: string;
	model?: string;
	apiKey?: string;
	/** Reference images for vision-capable models (Gemini / OpenAI). */
	images?: AIImageInput[];
}

export type VisionCapability = {
	available: boolean;
	provider?: "gemini" | "openai";
	model?: string;
	reason?: string;
};

/** Whether the process has credentials for a vision model. */
export function getVisionCapability(): VisionCapability {
	const geminiApiKey =
		process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	if (geminiApiKey) {
		return {
			available: true,
			provider: "gemini",
			model: templateConfig.VISION_MODEL,
		};
	}
	const openaiApiKey = process.env.OPENAI_API_KEY;
	if (openaiApiKey) {
		return {
			available: true,
			provider: "openai",
			model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
		};
	}
	return {
		available: false,
		reason:
			"No vision model configured. Set GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) or OPENAI_API_KEY to analyze reference images.",
	};
}

const VISION_SYSTEM_SUFFIX = `

You may receive reference image(s). Match their layout, spacing, typography hierarchy, color palette, and overall tone when generating the email HTML. Use email-safe inline styles that approximate the design; do not invent external image URLs unless the user provided them.`;

async function loadImageParts(images: AIImageInput[]) {
	const max = templateConfig.VISION_MAX_IMAGES;
	const parts: Array<{
		type: "image";
		image: Uint8Array;
		mediaType: string;
	}> = [];

	for (const img of images.slice(0, max)) {
		try {
			const res = await fetch(img.url);
			if (!res.ok) continue;
			const buf = new Uint8Array(await res.arrayBuffer());
			if (buf.byteLength === 0 || buf.byteLength > 8_000_000) continue;
			const mediaType =
				img.mime ||
				res.headers.get("content-type")?.split(";")[0]?.trim() ||
				"image/png";
			if (!mediaType.startsWith("image/")) continue;
			parts.push({ type: "image", image: buf, mediaType });
		} catch {
			// skip unreadable image
		}
	}
	return parts;
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

/** OpenRouter model ids look like `provider/model:variant` (e.g. inclusionai/ling-3.0-flash:free). */
function isOpenRouterModel(model: string) {
	const m = model.toLowerCase();
	return (
		m.startsWith("openrouter:") ||
		m.includes("/") ||
		m === templateConfig.OPENROUTER_MODEL.toLowerCase()
	);
}

function normalizeOpenRouterModelId(model: string) {
	return model.startsWith("openrouter:")
		? model.slice("openrouter:".length)
		: model;
}

function getOpenRouter() {
	const key = templateConfig.OPENROUTER_API_KEY;
	if (!key) return null;
	return createOpenRouter({
		apiKey: key,
		// Optional app attribution for OpenRouter dashboards
		headers: {
			"HTTP-Referer": templateConfig.BASE_URL,
			"X-Title": "Reloop Template Engine",
		},
	});
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

/**
 * Offline/dev mock — never dump the full agent prompt into the email body.
 * Only a short human-readable brief is shown.
 */
function extractUserBriefForMock(prompt: string): string {
	// Prefer the last "User:" turn from agent conversation prompts
	const userBlocks = [
		...prompt.matchAll(
			/(?:^|\n)User:\s*\n([\s\S]*?)(?=\n(?:User|Assistant|##)\b|$)/gi,
		),
	];
	const lastUser = userBlocks.at(-1)?.[1]?.trim();
	const raw = (lastUser || prompt).trim();

	// Drop structural agent sections if they leaked in
	const cleaned = raw
		.replace(/##[\s\S]*$/m, "")
		.replace(/Current HTML[\s\S]*$/i, "")
		.replace(/Respond with the complete[\s\S]*$/i, "")
		.replace(/<\/?[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();

	const brief = cleaned.slice(0, 120) || "your request";
	return brief
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

function mockTemplateHtml(prompt: string) {
	const safe = extractUserBriefForMock(prompt);
	return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#ffffff;border-radius:16px;border:1px solid #e4e4e7;">
  <tr>
    <td style="padding:32px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#71717a;">Preview</p>
      <h1 style="color:#09090b;font-size:24px;font-weight:700;margin:0 0 16px;line-height:1.25;">You're all set</h1>
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 16px;">Hi {{first_name}} — here's a starter template for <strong>${safe}</strong>.</p>
      <p style="color:#52525b;font-size:15px;line-height:1.6;margin:0 0 28px;">Connect a model (OpenRouter, Ollama/Gemma, Gemini, or OpenAI) for full AI generation. This is a local fallback so the editor never shows raw prompts.</p>
      <a href="https://reloop.sh" style="display:inline-block;background-color:#18181b;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:8px;">Get Started Now &rarr;</a>
    </td>
  </tr>
</table>`;
}

/**
 * Create an AI text stream for email template HTML.
 * Ladder: OpenRouter (default free model) → Gemma/Ollama → Gemini → OpenAI → mock HTML.
 * With images: vision path (Gemini → OpenAI) before text-only fallbacks.
 */
export async function createAIStream({
	prompt,
	system = DEFAULT_TEMPLATE_AI_SYSTEM,
	model,
	apiKey,
	images,
}: AIStreamInput): Promise<AIStreamHandle> {
	const openrouter = getOpenRouter();
	const defaultModel = openrouter
		? templateConfig.OPENROUTER_MODEL
		: templateConfig.GEMMA_MODEL;
	const resolvedModel = model || defaultModel;
	const hasImages = Boolean(images?.length);
	const systemWithVision = hasImages
		? `${system}${VISION_SYSTEM_SUFFIX}`
		: system;

	const geminiApiKey =
		apiKey ||
		process.env.GEMINI_API_KEY ||
		process.env.GOOGLE_GENERATIVE_AI_API_KEY;
	const openaiApiKey = apiKey || process.env.OPENAI_API_KEY;

	// ── Vision path when reference images are provided ───────────────
	if (hasImages && images) {
		const imageParts = await loadImageParts(images);
		if (imageParts.length > 0) {
			const userContent = [
				{ type: "text" as const, text: prompt },
				...imageParts,
			];

			if (geminiApiKey) {
				const visionModel =
					isGeminiModel(resolvedModel) && !isGemmaModel(resolvedModel)
						? resolvedModel
						: templateConfig.VISION_MODEL;
				const googleProvider = apiKey
					? createGoogleGenerativeAI({ apiKey: geminiApiKey })
					: google;
				// AI SDK v6 LanguageModel typing vs @ai-sdk/google v1
				const result = streamText({
					model: googleProvider(visionModel) as never,
					system: systemWithVision,
					messages: [{ role: "user", content: userContent }],
				});
				return {
					textStream: result.textStream,
					toTextStreamResponse: () => result.toTextStreamResponse(),
					toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
				};
			}

			if (openaiApiKey) {
				const visionModel =
					!isGemmaModel(resolvedModel) &&
					!isGeminiModel(resolvedModel) &&
					!isOpenRouterModel(resolvedModel)
						? resolvedModel
						: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini";
				const openaiProvider = apiKey
					? createOpenAI({ apiKey: openaiApiKey })
					: openai;
				const result = streamText({
					model: openaiProvider(visionModel) as never,
					system: systemWithVision,
					messages: [{ role: "user", content: userContent }],
				});
				return {
					textStream: result.textStream,
					toTextStreamResponse: () => result.toTextStreamResponse(),
					toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
				};
			}
		}
		// No vision provider or images failed to load — continue text-only
		// with attachment URLs already in the prompt.
	}

	// ── Text-only ladder: OpenRouter → Gemma → Gemini → OpenAI → mock ─
	if (openrouter && isOpenRouterModel(resolvedModel)) {
		try {
			const modelId = normalizeOpenRouterModelId(resolvedModel);
			const result = streamText({
				model: openrouter(modelId) as never,
				system: systemWithVision,
				prompt,
			});
			return {
				textStream: result.textStream,
				toTextStreamResponse: () => result.toTextStreamResponse(),
				toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
			};
		} catch {
			// fall through to other providers
		}
	}

	if (isGemmaModel(resolvedModel)) {
		const ollamaStream = await streamGemmaOllama(
			buildOllamaPrompt(systemWithVision, prompt),
			resolvedModel,
		);
		if (ollamaStream) return handleFromByteStream(ollamaStream);
	}

	if (isGeminiModel(resolvedModel) && geminiApiKey) {
		const googleProvider = apiKey
			? createGoogleGenerativeAI({ apiKey: geminiApiKey })
			: google;
		const result = streamText({
			model: googleProvider(resolvedModel) as never,
			system: systemWithVision,
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
		!isOpenRouterModel(resolvedModel) &&
		openaiApiKey
	) {
		const openaiProvider = apiKey
			? createOpenAI({ apiKey: openaiApiKey })
			: openai;
		const result = streamText({
			model: openaiProvider(resolvedModel) as never,
			system: systemWithVision,
			prompt,
		});
		return {
			textStream: result.textStream,
			toTextStreamResponse: () => result.toTextStreamResponse(),
			toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
		};
	}

	// Prefer OpenRouter free model even when an explicit non-OR model failed
	if (openrouter) {
		try {
			const result = streamText({
				model: openrouter(templateConfig.OPENROUTER_MODEL) as never,
				system: systemWithVision,
				prompt,
			});
			return {
				textStream: result.textStream,
				toTextStreamResponse: () => result.toTextStreamResponse(),
				toUIMessageStreamResponse: () => result.toUIMessageStreamResponse(),
			};
		} catch {
			// continue fallbacks
		}
	}

	// Fallback Gemma even when default wasn't Gemma (e.g. after failed vision)
	const ollamaStream = await streamGemmaOllama(
		buildOllamaPrompt(systemWithVision, prompt),
		templateConfig.GEMMA_MODEL,
	);
	if (ollamaStream) return handleFromByteStream(ollamaStream);

	const mockHtml = mockTemplateHtml(prompt);
	const mockChunks = mockHtml.match(/.{1,80}/g) || [mockHtml];
	return handleFromStringChunks(mockChunks);
}
