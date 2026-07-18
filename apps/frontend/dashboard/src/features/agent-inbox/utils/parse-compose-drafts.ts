import type { ComposeDraft, ComposeDraftKind } from "../types";

const KINDS = new Set<ComposeDraftKind>([
	"compose",
	"reply",
	"reply_all",
	"forward",
]);

function asString(value: unknown, fallback = ""): string {
	return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((v): v is string => typeof v === "string");
}

function asIso(value: unknown): string {
	if (typeof value === "string") return value;
	if (value instanceof Date) return value.toISOString();
	return new Date(0).toISOString();
}

function normalizeKind(value: unknown): ComposeDraftKind {
	if (typeof value === "string" && KINDS.has(value as ComposeDraftKind)) {
		return value as ComposeDraftKind;
	}
	return "compose";
}

/** Normalize one draft row from the API into `ComposeDraft`. */
export function parseComposeDraft(raw: unknown): ComposeDraft | null {
	if (!raw || typeof raw !== "object") return null;
	const row = raw as Record<string, unknown>;
	const id = asString(row.id);
	const mailboxId = asString(row.mailboxId ?? row.mailbox_id);
	if (!id || !mailboxId) return null;

	const threadRaw = row.threadId ?? row.thread_id;
	const replyRaw = row.inReplyToMessageId ?? row.in_reply_to_message_id;

	return {
		id,
		mailboxId,
		kind: normalizeKind(row.kind),
		threadId: typeof threadRaw === "string" && threadRaw ? threadRaw : null,
		inReplyToMessageId:
			typeof replyRaw === "string" && replyRaw ? replyRaw : null,
		to: asStringArray(row.to),
		cc: asStringArray(row.cc),
		bcc: asStringArray(row.bcc),
		subject: asString(row.subject),
		html: asString(row.html),
		text: asString(row.text),
		attachments: Array.isArray(row.attachments)
			? (row.attachments as ComposeDraft["attachments"])
			: [],
		createdAt: asIso(row.createdAt ?? row.created_at),
		updatedAt: asIso(row.updatedAt ?? row.updated_at),
	};
}

/**
 * Backend returns a bare array; tolerate `{ drafts: [...] }` for safety.
 */
export function parseComposeDraftsList(data: unknown): ComposeDraft[] {
	const rows = Array.isArray(data)
		? data
		: data &&
				typeof data === "object" &&
				Array.isArray((data as { drafts?: unknown }).drafts)
			? (data as { drafts: unknown[] }).drafts
			: [];

	const out: ComposeDraft[] = [];
	for (const row of rows) {
		const parsed = parseComposeDraft(row);
		if (parsed) out.push(parsed);
	}
	return out;
}
