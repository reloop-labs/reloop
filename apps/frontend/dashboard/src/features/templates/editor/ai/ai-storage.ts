import type { AiMessage, AiMode } from "./types";

const PREFIX = "reloop:template-ai:";
const MAX_MESSAGES = 40;

type StoredChat = {
	v: 1;
	mode: AiMode;
	messages: AiMessage[];
	updatedAt: number;
};

function key(templateId: string) {
	return `${PREFIX}${templateId}`;
}

/** Strip heavy/non-serializable fields before persist. */
function serializeMessages(messages: AiMessage[]): AiMessage[] {
	return messages.slice(-MAX_MESSAGES).map((m) => ({
		...m,
		// blob previews don't survive reload
		attachments: m.attachments?.map((a) => ({
			id: a.id,
			url: a.url,
			mime: a.mime,
			name: a.name,
		})),
		// keep html for revise context but cap size
		html: m.html && m.html.length > 120_000 ? m.html.slice(0, 120_000) : m.html,
	}));
}

export function loadAiChat(
	templateId: string | null | undefined,
): StoredChat | null {
	if (!templateId || typeof sessionStorage === "undefined") return null;
	try {
		const raw = sessionStorage.getItem(key(templateId));
		if (!raw) return null;
		const parsed = JSON.parse(raw) as StoredChat;
		if (parsed?.v !== 1 || !Array.isArray(parsed.messages)) return null;
		return parsed;
	} catch {
		return null;
	}
}

export function saveAiChat(
	templateId: string | null | undefined,
	data: { mode: AiMode; messages: AiMessage[] },
) {
	if (!templateId || typeof sessionStorage === "undefined") return;
	try {
		const payload: StoredChat = {
			v: 1,
			mode: data.mode,
			messages: serializeMessages(data.messages),
			updatedAt: Date.now(),
		};
		sessionStorage.setItem(key(templateId), JSON.stringify(payload));
	} catch {
		// quota / private mode — ignore
	}
}

export function clearAiChat(templateId: string | null | undefined) {
	if (!templateId || typeof sessionStorage === "undefined") return;
	try {
		sessionStorage.removeItem(key(templateId));
	} catch {
		// ignore
	}
}
