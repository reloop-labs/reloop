import type { AgentChatMessage, AgentPlan, EditorSnapshot } from "./types";

export const AGENT_HTML_SYSTEM = `You are Reloop's email template design agent for a React Email / TipTap editor.

Generate a complete, production-ready HTML email that the editor can load with setContent.

Rules:
- Output ONLY raw HTML — no markdown fences, no commentary before or after.
- Prefer table-based layout with inline CSS (email-client safe).
- Use semantic tags TipTap understands: p, h1, h2, h3, strong, em, a, ul, ol, li, img, hr, blockquote.
- Clear visual hierarchy, readable copy, one primary CTA (styled <a>).
- Width ~560–600px, mobile-friendly.
- Use {{variable_name}} placeholders for personalization (e.g. {{first_name}}).
- Start with a root <table> or <div> (DOCTYPE optional).
- When the user asks for a revision, revise the previous HTML rather than starting from scratch.`;

export const PLAN_SYSTEM = `You are Reloop's email template planning agent.

Given a user brief, output ONLY valid JSON (no markdown fences) with this shape:
{
  "summary": "one sentence plan summary",
  "steps": [
    { "id": "hero", "title": "Hero / header", "detail": "what goes here" },
    { "id": "body", "title": "Body content", "detail": "..." },
    { "id": "cta", "title": "Primary CTA", "detail": "..." },
    { "id": "footer", "title": "Footer", "detail": "..." },
    { "id": "variables", "title": "Variables", "detail": "list {{vars}}" }
  ]
}

Keep 4–7 steps. Be specific to the brief. No HTML.`;

export function buildConversationPrompt(input: {
	messages: AgentChatMessage[];
	editorSnapshot?: EditorSnapshot;
	attachments?: { url: string; name: string; mime: string }[];
	executePlan?: AgentPlan;
}): string {
	const parts: string[] = [];

	if (input.editorSnapshot) {
		const snap = input.editorSnapshot;
		parts.push("## Current editor context");
		if (snap.subject) parts.push(`Subject: ${snap.subject}`);
		if (snap.previewText) parts.push(`Preview text: ${snap.previewText}`);
		if (snap.variables) {
			parts.push(
				`Variables: ${typeof snap.variables === "string" ? snap.variables : JSON.stringify(snap.variables)}`,
			);
		}
		if (snap.renderedHtmlSnippet) {
			const html = snap.renderedHtmlSnippet.slice(0, 12000);
			parts.push(`Current HTML (may be truncated):\n${html}`);
		}
		parts.push("");
	}

	if (input.attachments?.length) {
		parts.push("## Reference attachments");
		for (const a of input.attachments) {
			parts.push(`- ${a.name} (${a.mime}): ${a.url}`);
		}
		parts.push(
			"Match layout, spacing, palette, and tone of references when possible.",
		);
		parts.push("");
	}

	if (input.executePlan) {
		parts.push("## Approved plan to execute");
		parts.push(input.executePlan.summary);
		for (const step of input.executePlan.steps) {
			parts.push(`- [${step.id}] ${step.title}: ${step.detail ?? ""}`);
		}
		parts.push("");
		parts.push("Implement the full email HTML according to this plan.");
		parts.push("");
	}

	parts.push("## Conversation");
	for (const m of input.messages) {
		if (m.role === "system") continue;
		const role = m.role === "assistant" ? "Assistant" : "User";
		parts.push(`${role}:\n${m.content}`);
	}

	parts.push("");
	parts.push(
		"Respond with the complete email HTML only (or revised HTML if this is a follow-up).",
	);
	return parts.join("\n");
}

export function buildPlanPrompt(input: {
	messages: AgentChatMessage[];
	editorSnapshot?: EditorSnapshot;
	attachments?: { url: string; name: string; mime: string }[];
}): string {
	const lastUser =
		[...input.messages].reverse().find((m) => m.role === "user")?.content ??
		"";
	const parts = [
		"## Brief",
		lastUser,
		"",
		"## Context",
		input.editorSnapshot?.subject
			? `Existing subject: ${input.editorSnapshot.subject}`
			: "No existing subject",
		input.editorSnapshot?.renderedHtmlSnippet
			? "Editor already has content — plan may revise it."
			: "Canvas is empty — plan a new template.",
	];
	if (input.attachments?.length) {
		parts.push(
			`Attachments: ${input.attachments.map((a) => a.name).join(", ")}`,
		);
	}
	return parts.join("\n");
}

export function extractVariablesFromHtml(html: string): string[] {
	const found = new Set<string>();
	const re = /\{\{\{?\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}?\}\}/g;
	let m: RegExpExecArray | null = re.exec(html);
	while (m) {
		if (m[1]) found.add(m[1]);
		m = re.exec(html);
	}
	return [...found];
}

export function parsePlanJson(raw: string): AgentPlan | null {
	const cleaned = raw
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/i, "")
		.trim();
	try {
		const parsed = JSON.parse(cleaned) as {
			summary?: string;
			steps?: { id?: string; title?: string; detail?: string }[];
		};
		if (!parsed.steps?.length) return null;
		const id = `plan_${Date.now().toString(36)}`;
		return {
			id,
			summary: parsed.summary?.trim() || "Email template plan",
			steps: parsed.steps.map((s, i) => ({
				id: s.id?.trim() || `step_${i + 1}`,
				title: s.title?.trim() || `Step ${i + 1}`,
				detail: s.detail?.trim(),
			})),
		};
	} catch {
		return null;
	}
}

export function fallbackPlan(brief: string): AgentPlan {
	const short = brief.slice(0, 80) || "email";
	return {
		id: `plan_${Date.now().toString(36)}`,
		summary: `Build a polished email for: ${short}`,
		steps: [
			{
				id: "structure",
				title: "Layout structure",
				detail: "600px table layout, header, body, footer",
			},
			{
				id: "copy",
				title: "Write copy",
				detail: "Headline, supporting text, personalization",
			},
			{
				id: "cta",
				title: "Primary CTA",
				detail: "One clear call-to-action button",
			},
			{
				id: "variables",
				title: "Variables",
				detail: "Add {{first_name}} and domain-specific vars",
			},
			{
				id: "polish",
				title: "Email-safe polish",
				detail: "Inline styles, mobile-friendly spacing",
			},
		],
	};
}
