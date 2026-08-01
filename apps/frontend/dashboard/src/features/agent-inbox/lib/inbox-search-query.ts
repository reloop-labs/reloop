import { parseEmail } from "#/features/agent-inbox/lib/email-address";
import type { InboundThread } from "../types";

export type InboxFilterChip =
	| "unread"
	| "starred"
	| "needs_approval"
	| "has_attachment";

export const INBOX_FILTER_CHIPS: {
	id: InboxFilterChip;
	label: string;
	operator: string;
}[] = [
	{ id: "unread", label: "Unread", operator: "is:unread" },
	{ id: "starred", label: "Starred", operator: "is:starred" },
	{
		id: "needs_approval",
		label: "Needs approval",
		operator: "is:needs_approval",
	},
	{
		id: "has_attachment",
		label: "Has attachment",
		operator: "has:attachment",
	},
];

export const FILTER_LABELS: Record<InboxFilterChip, string> = {
	unread: "Unread",
	starred: "Starred",
	needs_approval: "Needs approval",
	has_attachment: "Has attachment",
};

export type ParsedInboxQuery = {
	/** Free-text terms (non-operator) joined for list `q` param */
	text: string;
	from?: string;
	to?: string;
	subject?: string;
	filters: InboxFilterChip[];
};

const FILTER_ALIASES: Record<string, InboxFilterChip> = {
	"is:unread": "unread",
	"is:starred": "starred",
	"is:needs_approval": "needs_approval",
	"has:attachment": "has_attachment",
	"has:attachments": "has_attachment",
};

/**
 * Parse Gmail-like operators from a search string.
 * Supports: from: to: subject: is:unread|starred|needs_approval has:attachment
 */
export function parseInboxQuery(raw: string): ParsedInboxQuery {
	const tokens = raw.trim().split(/\s+/).filter(Boolean);
	const textParts: string[] = [];
	const filters = new Set<InboxFilterChip>();
	let from: string | undefined;
	let to: string | undefined;
	let subject: string | undefined;

	for (const token of tokens) {
		const lower = token.toLowerCase();
		const alias = FILTER_ALIASES[lower];
		if (alias) {
			filters.add(alias);
			continue;
		}

		const colon = token.indexOf(":");
		if (colon > 0) {
			const key = token.slice(0, colon).toLowerCase();
			const value = token.slice(colon + 1).replace(/^["']|["']$/g, "");
			if (!value) {
				textParts.push(token);
				continue;
			}
			if (key === "from") {
				from = value;
				continue;
			}
			if (key === "to") {
				to = value;
				continue;
			}
			if (key === "subject") {
				subject = value;
				continue;
			}
			if (key === "is" || key === "has") {
				const mapped = FILTER_ALIASES[`${key}:${value.toLowerCase()}`];
				if (mapped) {
					filters.add(mapped);
					continue;
				}
			}
		}

		textParts.push(token);
	}

	return {
		text: textParts.join(" ").trim(),
		from,
		to,
		subject,
		filters: Array.from(filters),
	};
}

function includesInsensitive(haystack: string | undefined, needle: string) {
	if (!needle) return true;
	return (haystack ?? "").toLowerCase().includes(needle.toLowerCase());
}

function threadToBlob(thread: InboundThread): string {
	const to = (thread.toEmails ?? []).join(" ");
	return [
		thread.subject,
		thread.preview,
		thread.from.email,
		thread.from.name,
		to,
	]
		.filter(Boolean)
		.join(" ")
		.toLowerCase();
}

/** Match a thread against a parsed query (text + field operators). */
export function threadMatchesQuery(
	thread: InboundThread,
	parsed: ParsedInboxQuery,
): boolean {
	if (parsed.from) {
		const fromBlob = `${thread.from.name ?? ""} ${thread.from.email}`;
		if (!includesInsensitive(fromBlob, parsed.from)) return false;
	}

	if (parsed.to) {
		const toBlob = (thread.toEmails ?? [])
			.map((addr) => {
				const { name, email } = parseEmail(addr);
				return `${name} ${email}`;
			})
			.join(" ");
		if (!includesInsensitive(toBlob, parsed.to)) return false;
	}

	if (parsed.subject) {
		if (!includesInsensitive(thread.subject, parsed.subject)) return false;
	}

	if (parsed.text) {
		if (!threadToBlob(thread).includes(parsed.text.toLowerCase())) {
			return false;
		}
	}

	return true;
}

export function threadMatchesFilters(
	thread: InboundThread,
	filters: InboxFilterChip[],
): boolean {
	if (filters.includes("unread") && !thread.unread) return false;
	if (filters.includes("starred") && !thread.isStarred) return false;
	if (
		filters.includes("needs_approval") &&
		thread.status !== "needs_approval"
	) {
		return false;
	}
	if (
		filters.includes("has_attachment") &&
		(thread.attachments?.length ?? 0) === 0
	) {
		return false;
	}
	return true;
}

export function applyInboxFilters(
	threads: InboundThread[],
	searchQuery: string,
	filterParam: string,
): InboundThread[] {
	const parsed = parseInboxQuery(searchQuery);
	const urlFilters = filterParam
		.split(",")
		.filter(Boolean) as InboxFilterChip[];
	const filters = Array.from(new Set([...urlFilters, ...parsed.filters]));

	return threads.filter(
		(t) => threadMatchesQuery(t, parsed) && threadMatchesFilters(t, filters),
	);
}

/** Serialize parsed operators back into a compact `q` string (without is:/has:). */
export function serializeSearchText(parsed: ParsedInboxQuery): string {
	const parts: string[] = [];
	if (parsed.from) parts.push(`from:${parsed.from}`);
	if (parsed.to) parts.push(`to:${parsed.to}`);
	if (parsed.subject) parts.push(`subject:${parsed.subject}`);
	if (parsed.text) parts.push(parsed.text);
	return parts.join(" ").trim();
}

export function mergeFilterParam(
	current: string,
	toggle: InboxFilterChip,
): string | null {
	const set = new Set(current.split(",").filter(Boolean) as InboxFilterChip[]);
	if (set.has(toggle)) set.delete(toggle);
	else set.add(toggle);
	const next = Array.from(set);
	return next.length ? next.join(",") : null;
}
