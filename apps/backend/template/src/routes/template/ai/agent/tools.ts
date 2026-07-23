import {
	createAIStream,
	getVisionCapability,
	type AIImageInput,
} from "../ai.controllers";
import {
	AGENT_HTML_SYSTEM,
	PLAN_SYSTEM,
	buildConversationPrompt,
	buildPlanPrompt,
	extractVariablesFromHtml,
	fallbackPlan,
	isLeakedOrInvalidEmailHtml,
	parsePlanJson,
} from "./prompts";
import type {
	AgentAttachment,
	AgentChatMessage,
	AgentPlan,
	EditorSnapshot,
} from "./types";

function toImageInputs(
	attachments?: AgentAttachment[],
): AIImageInput[] | undefined {
	if (!attachments?.length) return undefined;
	return attachments
		.filter((a) => a.mime?.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(a.url))
		.map((a) => ({ url: a.url, mime: a.mime }));
}

export type ToolContext = {
	messages: AgentChatMessage[];
	editorSnapshot?: EditorSnapshot;
	attachments?: AgentAttachment[];
	executePlan?: AgentPlan;
	model?: string;
	/** Last known HTML from this run (for revise) */
	lastHtml?: string;
};

export type ToolResult<T = unknown> = {
	ok: boolean;
	data: T;
	summary: string;
};

function cleanHtml(raw: string) {
	return raw
		.replace(/^```(?:html)?\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();
}

async function collectStream(
	textStream: AsyncIterable<string>,
	onChunk?: (chunk: string) => void,
): Promise<string> {
	let acc = "";
	for await (const chunk of textStream) {
		acc += chunk;
		onChunk?.(chunk);
	}
	return acc;
}

/** Tool: read snapshot supplied by the client (no network). */
export function toolGetEditorSnapshot(
	ctx: ToolContext,
): ToolResult<EditorSnapshot> {
	const snap = ctx.editorSnapshot ?? {};
	const hasHtml = Boolean(snap.renderedHtmlSnippet?.trim());
	const hasVars = Array.isArray(snap.variables)
		? snap.variables.length > 0
		: Boolean(snap.variables);
	return {
		ok: true,
		data: snap,
		summary: hasHtml
			? `Editor has content${hasVars ? " and variables" : ""}${snap.subject ? `; subject “${snap.subject}”` : ""}`
			: "Canvas is empty — generating a new template",
	};
}

/** Tool: create structured plan via LLM. */
export async function toolCreatePlan(
	ctx: ToolContext,
): Promise<ToolResult<AgentPlan>> {
	const planPrompt = buildPlanPrompt({
		messages: ctx.messages,
		editorSnapshot: ctx.editorSnapshot,
		attachments: ctx.attachments,
	});

	try {
		const stream = await createAIStream({
			prompt: planPrompt,
			system: PLAN_SYSTEM,
			model: ctx.model,
			images: toImageInputs(ctx.attachments),
		});
		const raw = await collectStream(stream.textStream);
		const plan =
			parsePlanJson(raw) ??
			fallbackPlan(
				[...ctx.messages].reverse().find((m) => m.role === "user")?.content ??
					"",
			);
		return {
			ok: true,
			data: plan,
			summary: plan.summary,
		};
	} catch (err) {
		const plan = fallbackPlan(
			[...ctx.messages].reverse().find((m) => m.role === "user")?.content ??
				"",
		);
		return {
			ok: true,
			data: plan,
			summary: `Fallback plan (${err instanceof Error ? err.message : "model error"})`,
		};
	}
}

/** Tool: check reference images / vision availability. */
export function toolAnalyzeReferences(
	ctx: ToolContext,
): ToolResult<{
	vision: boolean;
	imageCount: number;
	provider?: string;
	model?: string;
	warning?: string;
}> {
	const images = toImageInputs(ctx.attachments) ?? [];
	if (images.length === 0) {
		return {
			ok: true,
			data: { vision: false, imageCount: 0 },
			summary: "No reference images attached",
		};
	}

	const cap = getVisionCapability();
	if (!cap.available) {
		return {
			ok: true,
			data: {
				vision: false,
				imageCount: images.length,
				warning: cap.reason,
			},
			summary: `Attached ${images.length} image(s) but vision is unavailable — continuing text-only`,
		};
	}

	return {
		ok: true,
		data: {
			vision: true,
			imageCount: images.length,
			provider: cap.provider,
			model: cap.model,
		},
		summary: `Using ${cap.provider}/${cap.model} for ${images.length} reference image(s)`,
	};
}

/** Tool: generate full email HTML. */
export async function toolGenerateEmailHtml(
	ctx: ToolContext,
	onHtmlChunk?: (chunk: string) => void,
): Promise<ToolResult<{ html: string; usedVision: boolean }>> {
	const prompt = buildConversationPrompt({
		messages: ctx.messages,
		editorSnapshot: ctx.editorSnapshot,
		attachments: ctx.attachments,
		executePlan: ctx.executePlan,
	});
	const images = toImageInputs(ctx.attachments);
	const vision = getVisionCapability();
	const usedVision = Boolean(images?.length && vision.available);

	const stream = await createAIStream({
		prompt,
		system: AGENT_HTML_SYSTEM,
		model: ctx.model,
		images,
	});
	const raw = await collectStream(stream.textStream, onHtmlChunk);
	const html = cleanHtml(raw);
	if (!html) {
		return {
			ok: false,
			data: { html: "", usedVision },
			summary: "Model returned empty HTML",
		};
	}
	if (isLeakedOrInvalidEmailHtml(html)) {
		return {
			ok: false,
			data: { html: "", usedVision },
			summary:
				"Model returned invalid/leaked content (prompt dump). Check that Ollama/Gemini/OpenAI is running, then retry.",
		};
	}
	return {
		ok: true,
		data: { html, usedVision },
		summary: usedVision
			? `Generated ${html.length.toLocaleString()} chars with vision references`
			: `Generated ${html.length.toLocaleString()} characters of HTML`,
	};
}

/** Tool: revise existing HTML from follow-up instruction. */
export async function toolReviseEmailHtml(
	ctx: ToolContext,
	onHtmlChunk?: (chunk: string) => void,
): Promise<ToolResult<{ html: string; usedVision: boolean }>> {
	const prior =
		ctx.lastHtml ||
		ctx.editorSnapshot?.renderedHtmlSnippet ||
		"";
	const lastUser =
		[...ctx.messages].reverse().find((m) => m.role === "user")?.content ??
		"";

	const prompt = [
		"Revise the following email HTML according to the user instruction.",
		"Return ONLY the full updated HTML (no markdown fences).",
		"",
		"## User instruction",
		lastUser,
		"",
		"## Previous HTML",
		prior.slice(0, 14000),
	].join("\n");

	const images = toImageInputs(ctx.attachments);
	const vision = getVisionCapability();
	const usedVision = Boolean(images?.length && vision.available);

	const stream = await createAIStream({
		prompt,
		system: AGENT_HTML_SYSTEM,
		model: ctx.model,
		images,
	});
	const raw = await collectStream(stream.textStream, onHtmlChunk);
	const html = cleanHtml(raw);
	if (!html) {
		return {
			ok: false,
			data: { html: prior, usedVision },
			summary: "Revise produced empty HTML; kept previous",
		};
	}
	if (isLeakedOrInvalidEmailHtml(html)) {
		return {
			ok: false,
			data: { html: prior, usedVision },
			summary:
				"Revise returned invalid/leaked content; previous HTML kept. Retry after checking the model.",
		};
	}
	return {
		ok: true,
		data: { html, usedVision },
		summary: usedVision
			? `Revised with vision (${html.length.toLocaleString()} chars)`
			: `Revised HTML (${html.length.toLocaleString()} chars)`,
	};
}

/** Tool: extract {{variables}} from HTML. */
export function toolExtractVariables(
	html: string,
): ToolResult<{ variables: string[] }> {
	const variables = extractVariablesFromHtml(html);
	return {
		ok: true,
		data: { variables },
		summary:
			variables.length > 0
				? `Found ${variables.length}: ${variables.map((v) => `{{${v}}}`).join(", ")}`
				: "No template variables detected",
	};
}

export type CritiqueResult = {
	score: number;
	notes: string[];
};

/** Tool: lightweight heuristic critique (no extra LLM call). */
export function toolCritiqueEmail(
	html: string,
): ToolResult<CritiqueResult> {
	const notes: string[] = [];
	let score = 100;

	const lower = html.toLowerCase();
	if (!/<a[\s>]/i.test(html)) {
		notes.push("No link/CTA found — consider adding a primary action");
		score -= 15;
	}
	if (!/\{\{/.test(html)) {
		notes.push("No {{variables}} — personalization may improve engagement");
		score -= 5;
	}
	if (!/style\s*=/i.test(html)) {
		notes.push("Little inline CSS — email clients may render poorly");
		score -= 10;
	}
	if (html.length < 400) {
		notes.push("HTML is quite short — body copy may be thin");
		score -= 10;
	}
	if (html.length > 80000) {
		notes.push("HTML is very large — may hit ESP size limits");
		score -= 10;
	}
	if (!/<table[\s>]/i.test(lower) && !/<div[\s>]/i.test(lower)) {
		notes.push("Unexpected root structure for email HTML");
		score -= 20;
	}
	if (notes.length === 0) {
		notes.push("Structure looks solid for a transactional/marketing email");
	}

	score = Math.max(0, Math.min(100, score));
	return {
		ok: true,
		data: { score, notes },
		summary: `Quality score ${score}/100 · ${notes[0]}`,
	};
}

/** Whether this turn looks like a revision of existing work. */
export function shouldRevise(ctx: ToolContext): boolean {
	const hasExisting = Boolean(
		ctx.lastHtml?.trim() ||
			ctx.editorSnapshot?.renderedHtmlSnippet?.trim(),
	);
	if (!hasExisting) return false;
	if (ctx.executePlan) return false;

	const userTurns = ctx.messages.filter((m) => m.role === "user");
	// Multi-turn chat, or single turn with existing canvas + revision language
	if (userTurns.length >= 2) return true;

	const last =
		[...ctx.messages].reverse().find((m) => m.role === "user")?.content ??
		"";
	return /\b(make|change|update|revise|fix|tweak|adjust|bigger|smaller|color|green|red|blue|replace|remove|add|move)\b/i.test(
		last,
	);
}

export const TOOL_LABELS: Record<string, string> = {
	get_editor_snapshot: "Reading template context",
	analyze_references: "Analyzing reference images",
	create_plan: "Creating plan",
	generate_email_html: "Writing email HTML",
	revise_email_html: "Revising email HTML",
	extract_variables: "Extracting variables",
	critique_email: "Reviewing quality",
};
