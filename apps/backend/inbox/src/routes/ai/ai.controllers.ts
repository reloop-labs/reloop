import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { generateText, streamText } from "ai";
import { and, eq } from "drizzle-orm";
import { createError } from "evlog";
import { useLogger } from "evlog/elysia";
import { inboxConfig } from "../../inbox.config";
import { getThreadController } from "../threads/get-thread/get-thread.controllers";

/** Cap how many messages enter the reply prompt (most recent first after sort). */
const REPLY_MAX_MESSAGES = 12;
/** Cap each message body excerpt in the prompt. */
const REPLY_MAX_BODY_CHARS = 1500;

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function plainTextToHtml(body: string) {
	return body
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((p) => `<p>${escapeHtml(p).replaceAll("\n", "<br />")}</p>`)
		.join("\n");
}

function heuristicSubject(text: string) {
	const firstLine =
		text
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line.length > 0) ?? "Untitled";
	return firstLine.slice(0, 80);
}

function heuristicComposeText(prompt: string) {
	const paragraphs = prompt
		.split(/\n\s*\n/)
		.map((p) => p.trim())
		.filter(Boolean);
	const blocks = paragraphs.length > 0 ? paragraphs : [prompt.trim()];
	return blocks.join("\n\n");
}

function bodyExcerpt(
	email: { textBody?: string | null; htmlBody?: string | null } | null,
	maxChars: number,
): string {
	if (!email) return "";
	const fromText = email.textBody?.trim() ?? "";
	const fromHtml = (email.htmlBody ?? "")
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	const raw = fromText || fromHtml;
	if (!raw) return "";
	if (raw.length <= maxChars) return raw;
	return `${raw.slice(0, maxChars)}…`;
}

type HydratedThreadMessage = {
	direction: string;
	messageAt: Date | string | null;
	email: {
		fromEmail?: string | null;
		fromName?: string | null;
		toEmails?: string[] | null;
		ccEmails?: string[] | null;
		replyTo?: string | null;
		textBody?: string | null;
		htmlBody?: string | null;
	} | null;
};

type MailboxIdentity = {
	email: string;
	displayName: string | null;
};

function formatPerson(name?: string | null, email?: string | null): string {
	const n = name?.trim();
	const e = email?.trim();
	if (n && e) return `${n} <${e}>`;
	if (n) return n;
	if (e) return e;
	return "(unknown)";
}

function formatAddressList(emails?: string[] | null): string | null {
	if (!emails?.length) return null;
	return emails.filter(Boolean).join(", ");
}

function compactThreadForPrompt(input: {
	subject: string | null;
	participants: string[];
	mailbox: MailboxIdentity | null;
	messages: HydratedThreadMessage[];
}): string {
	const chronological = [...input.messages].sort((a, b) => {
		const aAt = a.messageAt ? new Date(a.messageAt).getTime() : 0;
		const bAt = b.messageAt ? new Date(b.messageAt).getTime() : 0;
		return aAt - bAt;
	});
	const windowed = chronological.slice(-REPLY_MAX_MESSAGES);

	const writingAs = input.mailbox
		? formatPerson(input.mailbox.displayName, input.mailbox.email)
		: null;

	const lines: string[] = [
		writingAs ? `Writing as: ${writingAs}` : null,
		input.mailbox?.email ? `Our mailbox email: ${input.mailbox.email}` : null,
		input.mailbox?.displayName
			? `Our display name: ${input.mailbox.displayName}`
			: null,
		`Subject: ${input.subject?.trim() || "(no subject)"}`,
		input.participants.length
			? `Thread participants: ${input.participants.join(", ")}`
			: null,
		"",
		"Conversation (oldest → newest):",
	].filter((line): line is string => line !== null);

	for (const msg of windowed) {
		const email = msg.email;
		const from = formatPerson(email?.fromName, email?.fromEmail);
		const to = formatAddressList(email?.toEmails);
		const cc = formatAddressList(email?.ccEmails ?? null);
		const when = msg.messageAt
			? new Date(msg.messageAt).toISOString()
			: "unknown time";
		const body = bodyExcerpt(email, REPLY_MAX_BODY_CHARS) || "(empty)";
		const headerLines = [
			"---",
			`[${msg.direction}] at ${when}`,
			`From: ${from}`,
			to ? `To: ${to}` : null,
			cc ? `Cc: ${cc}` : null,
			email?.replyTo ? `Reply-To: ${email.replyTo}` : null,
			"",
			body,
			"",
		].filter((line): line is string => line !== null);
		lines.push(...headerLines);
	}

	return lines.join("\n").trim();
}

function heuristicReplyText(threadContext: string) {
	const lastInbound = threadContext
		.split("---")
		.filter((block) => block.includes("[inbound]"))
		.at(-1);
	const snippet = lastInbound
		?.split("\n")
		.slice(2)
		.join(" ")
		.replace(/\s+/g, " ")
		.trim()
		.slice(0, 120);
	return snippet
		? `Thanks for your message. Regarding: "${snippet}${snippet.length >= 120 ? "…" : ""}" — I'll follow up shortly.`
		: "Thanks for your message. I'll follow up shortly.";
}

function getOpenRouter() {
	const apiKey = inboxConfig.OPENROUTER_API_KEY;
	if (!apiKey) return null;
	return createOpenRouter({ apiKey });
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

/** Fake token stream so fallbacks still feel progressive in the UI. */
function chunkedPlainTextStream(text: string, delayMs = 14) {
	const encoder = new TextEncoder();
	const chunks = text.match(/[\s\S]{1,5}/g) ?? [text];
	return new ReadableStream<Uint8Array>({
		async start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
				await new Promise((resolve) => setTimeout(resolve, delayMs));
			}
			controller.close();
		},
	});
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

/** Stream Ollama /api/generate NDJSON into a plain-text byte stream. */
async function streamGemmaOllama(
	prompt: string,
): Promise<ReadableStream<Uint8Array> | null> {
	try {
		const baseUrl = inboxConfig.OLLAMA_BASE_URL.replace(/\/$/, "");
		const res = await fetch(`${baseUrl}/api/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: inboxConfig.GEMMA_MODEL,
				prompt,
				stream: true,
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

async function streamPlainTextFromPrompt(
	prompt: string,
	fallbackText: string,
): Promise<Response> {
	const log = useLogger();

	// Prefer OpenRouter streaming for low time-to-first-token when configured.
	const openrouter = getOpenRouter();
	if (openrouter) {
		try {
			const result = streamText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt,
			});
			return result.toTextStreamResponse();
		} catch (error) {
			log.warn(
				`[AI] OpenRouter stream failed: ${
					error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	const ollamaStream = await streamGemmaOllama(prompt);
	if (ollamaStream) {
		return plainTextStreamResponse(ollamaStream);
	}

	return plainTextStreamResponse(chunkedPlainTextStream(fallbackText));
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

	const gemmaPrompt = `Write a concise email subject line (max 80 characters) for the following email body. Return ONLY the subject line text (no quotes, no "Subject:" prefix, no conversational text):\n\n${text}`;
	const gemmaResult = await callGemmaOllama(gemmaPrompt);
	if (gemmaResult) {
		return {
			subject: gemmaResult
				.replace(/^Subject:\s*/i, "")
				.replace(/^["']|["']$/g, "")
				.slice(0, 120),
		};
	}

	const openrouter = getOpenRouter();
	if (openrouter) {
		try {
			const { text: subject } = await generateText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt: `Write a concise email subject line (max 80 characters) for the following email body. Return only the subject text (no quotes, no "Subject:" prefix).\n\n${text}`,
			});
			return {
				subject: subject
					.trim()
					.replace(/^Subject:\s*/i, "")
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

	return { subject: heuristicSubject(text).replace(/^Subject:\s*/i, "") };
}

export async function generateComposeController(input: {
	prompt: string;
	subject?: string;
	to?: string[];
}) {
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

	const fullPrompt = `Compose a professional email body based on the following context. Return plain text ONLY (no markdown fences, no "Subject:" line, no commentary). Use short paragraphs:\n\n${contextParts.join("\n")}`;

	return streamPlainTextFromPrompt(fullPrompt, heuristicComposeText(prompt));
}

function buildReplySystemPrompt(input: {
	tone?: string;
	instruction?: string;
	mailbox: MailboxIdentity | null;
}) {
	const tone = input.tone?.trim();
	const instruction = input.instruction?.trim();
	const writingAs = input.mailbox
		? formatPerson(input.mailbox.displayName, input.mailbox.email)
		: null;
	return [
		"You are drafting an email reply for the mailbox owner.",
		writingAs
			? `Write in the first person as ${writingAs}. Use their name when signing if a sign-off is appropriate.`
			: null,
		"Use the conversation history below. Respond to the latest message.",
		"Address people by the names shown in From headers when available.",
		"Match the tone of prior outbound messages from us when present.",
		"Do not invent facts, commitments, dates, or links that are not in the thread.",
		"Return plain text only (no markdown fences, no subject line, no commentary).",
		"Use short paragraphs.",
		tone ? `Tone: ${tone}.` : null,
		instruction ? `Additional instruction: ${instruction}` : null,
	]
		.filter(Boolean)
		.join(" ");
}

export async function generateReplyController(input: {
	threadId: string;
	organizationId: string;
	tone?: string;
	instruction?: string;
}) {
	const threadId = input.threadId.trim();

	if (!threadId) {
		throw createError({
			status: 400,
			message: "threadId is required",
			why: "Request body threadId was empty",
			fix: "Provide the thread ID to draft a reply against",
		});
	}

	const thread = await getThreadController(threadId, input.organizationId);

	if (!thread.messages.length) {
		throw createError({
			status: 400,
			message: "Thread has no messages",
			why: `Thread ${threadId} has an empty conversation`,
			fix: "Wait for at least one message before generating a reply",
		});
	}

	let mailboxIdentity: MailboxIdentity | null = null;
	if (thread.mailboxId) {
		const mb = await db.query.mailbox.findFirst({
			where: and(
				eq(mailbox.id, thread.mailboxId),
				eq(mailbox.organizationId, input.organizationId),
			),
			columns: {
				email: true,
				displayName: true,
			},
		});
		if (mb) {
			mailboxIdentity = {
				email: mb.email,
				displayName: mb.displayName,
			};
		}
	}

	const threadContext = compactThreadForPrompt({
		subject: thread.subject,
		participants: thread.participants || [],
		mailbox: mailboxIdentity,
		messages: thread.messages as HydratedThreadMessage[],
	});

	const systemPrompt = buildReplySystemPrompt({
		tone: input.tone,
		instruction: input.instruction,
		mailbox: mailboxIdentity,
	});
	const fullPrompt = `${systemPrompt}\n\n${threadContext}`;

	return streamPlainTextFromPrompt(
		fullPrompt,
		heuristicReplyText(threadContext),
	);
}

/** Convert streamed plain text into editor HTML. */
export { plainTextToHtml };
