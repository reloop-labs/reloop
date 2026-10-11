/**
 * Email handed off by the public editor (`/tools/email-html-editor`). It sits
 * in localStorage on the shared origin until a signed-in user with an active
 * workspace reaches the dashboard, which turns it into a template.
 *
 * Keep in sync with the web app's `lib/email-html-editor/utils/pending-template-draft.ts`.
 */
export const PENDING_TEMPLATE_DRAFT_KEY = "reloop:pending-template-draft";

/** Drafts older than this are dropped instead of claimed. */
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export interface PendingTemplateVariable {
	name: string;
	type: "string" | "number";
	defaultValue: string | null;
}

export interface PendingTemplateDraft {
	version: 1;
	name: string;
	subject: string;
	previewText: string;
	html: string;
	/** Editor document nodes, present when the canvas was edited in the tool. */
	content?: unknown[];
	variables: PendingTemplateVariable[];
	createdAt: string;
}

function isPendingTemplateDraft(value: unknown): value is PendingTemplateDraft {
	if (!value || typeof value !== "object") return false;
	const draft = value as Record<string, unknown>;
	return (
		draft.version === 1 &&
		typeof draft.name === "string" &&
		typeof draft.subject === "string" &&
		typeof draft.previewText === "string" &&
		typeof draft.html === "string" &&
		draft.html.trim().length > 0 &&
		(draft.content === undefined || Array.isArray(draft.content)) &&
		Array.isArray(draft.variables) &&
		typeof draft.createdAt === "string"
	);
}

export function readPendingTemplateDraft(): PendingTemplateDraft | null {
	let raw: string | null = null;
	try {
		raw = window.localStorage.getItem(PENDING_TEMPLATE_DRAFT_KEY);
	} catch {
		return null;
	}
	if (!raw) return null;

	try {
		const parsed: unknown = JSON.parse(raw);
		const age = isPendingTemplateDraft(parsed)
			? Date.now() - Date.parse(parsed.createdAt)
			: Number.NaN;
		if (isPendingTemplateDraft(parsed) && age >= 0 && age <= MAX_AGE_MS) {
			return parsed;
		}
	} catch {
		// Malformed entry, fall through and drop it.
	}
	clearPendingTemplateDraft();
	return null;
}

export function clearPendingTemplateDraft(): void {
	try {
		window.localStorage.removeItem(PENDING_TEMPLATE_DRAFT_KEY);
	} catch {
		// Storage blocked; nothing to clear.
	}
}

export function restorePendingTemplateDraft(draft: PendingTemplateDraft): void {
	try {
		window.localStorage.setItem(
			PENDING_TEMPLATE_DRAFT_KEY,
			JSON.stringify(draft),
		);
	} catch {
		// Storage blocked or full; the draft is lost.
	}
}
