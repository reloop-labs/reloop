import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { inboxConfig } from "../../inbox.config";

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function heuristicSubject(text: string) {
	const firstLine =
		text
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line.length > 0) ?? "Untitled";
	return firstLine.slice(0, 80);
}

function heuristicCompose(prompt: string) {
	const paragraphs = prompt
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);

	const blocks = paragraphs.length > 0 ? paragraphs : [prompt.trim()];
	const text = blocks.join("\n\n");
	const html = blocks
		.map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br />")}</p>`)
		.join("\n");

	return { html, text };
}

function getOpenRouter() {
	const apiKey = inboxConfig.OPENROUTER_API_KEY;
	if (!apiKey) return null;
	return createOpenRouter({ apiKey });
}

async function callGemmaOllama(prompt: string): Promise<string | null> {
	try {
		const baseUrl = inboxConfig.OLLAMA_BASE_URL.replace(/\/$/, "");
		const res = await fetch(`${baseUrl}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: inboxConfig.GEMMA_MODEL,
				prompt: prompt,
				stream: false,
			}),
		});
		if (!res.ok) return null;
		const data = (await res.json()) as { response?: string };
		return data.response ? data.response.trim() : null;
	} catch {
		return null;
	}
}

export async function generateSubjectController(input: { text: string }) {
	const log = useLogger();
	const text = input.text.trim();

	if (!text) {
		throw createError({
			status: 400,
			message: "Text is required",
			why: "Request body text was empty",
			fix: "Provide email body text to generate a subject",
		});
	}

	// 1. Try local Ollama / Gemma 2
	const gemmaPrompt = `Write a concise email subject line (max 80 characters) for the following email body. Return ONLY the subject line, no quotes, no conversational text:\n\n${text}`;
	const gemmaResult = await callGemmaOllama(gemmaPrompt);
	if (gemmaResult) {
		return {
			subject: gemmaResult
				.replace(/^["']|["']$/g, "")
				.slice(0, 120),
		};
	}

	// 2. Try OpenRouter if configured
	const openrouter = getOpenRouter();
	if (openrouter) {
		try {
			const { text: subject } = await generateText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt: `Write a concise email subject line (max 80 characters) for the following email body. Return only the subject, no quotes.\n\n${text}`,
			});
			return {
				subject: subject
					.trim()
					.replace(/^["']|["']$/g, "")
					.slice(0, 120),
			};
		} catch (error) {
			log.warn(
				`[AI] Subject generation failed, using fallback: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	return { subject: heuristicSubject(text) };
}

export async function generateComposeController(input: {
	prompt: string;
	subject?: string;
	to?: string[];
}) {
	const log = useLogger();
	const prompt = input.prompt.trim();

	if (!prompt) {
		throw createError({
			status: 400,
			message: "Prompt is required",
			why: "Request body prompt was empty",
			fix: "Provide a prompt describing the email to compose",
		});
	}

	const contextParts = [
		input.subject ? `Subject: ${input.subject}` : null,
		input.to?.length ? `To: ${input.to.join(", ")}` : null,
		`Prompt: ${prompt}`,
	].filter(Boolean);

	// 1. Try local Ollama / Gemma 2
	const gemmaPrompt = `Compose a professional email from the following context. Return plain text only (no markdown fences or commentary). Use short paragraphs:\n\n${contextParts.join("\n")}`;
	const gemmaResult = await callGemmaOllama(gemmaPrompt);

	if (gemmaResult) {
		const body = gemmaResult.trim();
		const html = body
			.split(/\n\s*\n/)
			.map((p) => p.trim())
			.filter(Boolean)
			.map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br />")}</p>`)
			.join("\n");

		return { html, text: body };
	}

	// 2. Try OpenRouter if configured
	const openrouter = getOpenRouter();
	if (openrouter) {
		try {
			const { text } = await generateText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt: `Compose a professional email from the following context. Return plain text only (no markdown fences). Use short paragraphs.\n\n${contextParts.join("\n")}`,
			});

			const body = text.trim();
			const html = body
				.split(/\n\s*\n/)
				.map((p) => p.trim())
				.filter(Boolean)
				.map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br />")}</p>`)
				.join("\n");

			return { html, text: body };
		} catch (error) {
			log.warn(
				`[AI] Compose generation failed, using fallback: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	return heuristicCompose(prompt);
}
