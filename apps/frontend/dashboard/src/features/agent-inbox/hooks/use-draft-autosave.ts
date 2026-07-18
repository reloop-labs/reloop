import { useAgentInbox } from "#/features/agent-inbox/components/agent-inbox-provider";
import type {
	ComposeDraftAttachment,
	ComposeDraftKind,
} from "#/features/agent-inbox/types";
import { useEffect, useRef } from "react";

type DraftAutosaveInput = {
	enabled: boolean;
	hasContent: boolean;
	draftId: string | null;
	onDraftIdChange: (id: string) => void;
	mailboxId: string;
	kind: ComposeDraftKind;
	threadId?: string | null;
	inReplyToMessageId?: string | null;
	to?: string[];
	cc?: string[];
	bcc?: string[];
	subject?: string;
	html?: string;
	text?: string;
	attachments?: ComposeDraftAttachment[];
	debounceMs?: number;
};

/** Debounced saveDraft — mirrors compose-modal autosave. */
export function useDraftAutosave({
	enabled,
	hasContent,
	draftId,
	onDraftIdChange,
	mailboxId,
	kind,
	threadId,
	inReplyToMessageId,
	to,
	cc,
	bcc,
	subject,
	html,
	text,
	attachments,
	debounceMs = 3000,
}: DraftAutosaveInput) {
	const { saveDraft } = useAgentInbox();
	const draftIdRef = useRef(draftId);
	draftIdRef.current = draftId;
	const onDraftIdChangeRef = useRef(onDraftIdChange);
	onDraftIdChangeRef.current = onDraftIdChange;

	useEffect(() => {
		if (!enabled || !hasContent || !mailboxId) return;

		const timer = window.setTimeout(() => {
			void (async () => {
				try {
					const saved = await saveDraft({
						id: draftIdRef.current || undefined,
						mailboxId,
						kind,
						threadId: threadId ?? null,
						inReplyToMessageId: inReplyToMessageId ?? null,
						to,
						cc,
						bcc,
						subject,
						html,
						text,
						attachments,
					});
					if (saved?.id && draftIdRef.current !== saved.id) {
						onDraftIdChangeRef.current(saved.id);
					}
				} catch {
					/* silent — same as compose modal */
				}
			})();
		}, debounceMs);

		return () => window.clearTimeout(timer);
	}, [
		enabled,
		hasContent,
		mailboxId,
		kind,
		threadId,
		inReplyToMessageId,
		to,
		cc,
		bcc,
		subject,
		html,
		text,
		attachments,
		debounceMs,
		saveDraft,
	]);
}
