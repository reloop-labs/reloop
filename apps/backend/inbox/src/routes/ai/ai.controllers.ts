import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { db } from "@reloop/db/client";
import { mailbox } from "@reloop/db/schema";
import { generateText } from "ai";
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
		input.mailbox?.email
			? `Our mailbox email: ${input.mailbox.email}`
			: null,
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

function heuristicReply(threadContext: string) {
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
	const text = snippet
		? `Thanks for your message. Regarding: "${snippet}${snippet.length >= 120 ? "…" : ""}" — I'll follow up shortly.`
		: "Thanks for your message. I'll follow up shortly.";
	return { html: plainTextToHtml(text), text };
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
				`[AI] Subject generation failed, using fallback: ${error instanceof Error ? error.message : String(error)
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
		return { html: plainTextToHtml(body), text: body };
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
			return { html: plainTextToHtml(body), text: body };
		} catch (error) {
			log.warn(
				`[AI] Compose generation failed, using fallback: ${error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	return heuristicCompose(prompt);
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
	const log = useLogger();
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

	// 1. Try local Ollama / Gemma 2
	const gemmaResult = await callGemmaOllama(fullPrompt);
	if (gemmaResult) {
		const body = gemmaResult.trim();
		return { html: plainTextToHtml(body), text: body };
	}

	// 2. Try OpenRouter if configured
	const openrouter = getOpenRouter();
	if (openrouter) {
		try {
			const { text } = await generateText({
				model: openrouter("openai/gpt-4o-mini"),
				prompt: fullPrompt,
			});
			const body = text.trim();
			return { html: plainTextToHtml(body), text: body };
		} catch (error) {
			log.warn(
				`[AI] Reply generation failed, using fallback: ${error instanceof Error ? error.message : String(error)
				}`,
			);
		}
	}

	return heuristicReply(threadContext);
}
