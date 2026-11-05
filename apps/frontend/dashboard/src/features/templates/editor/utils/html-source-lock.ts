import type { Editor } from "@tiptap/core";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";

/**
 * Pasted or hand-written HTML is sent as-is ("locked") so imported emails keep
 * their exact markup. That only holds until someone edits the canvas: from
 * then on the visual document is the source of truth again, otherwise every
 * canvas change (a footer, a color, a word) would be silently dropped from the
 * code view, test sends, publish and the sent email.
 *
 * Programmatic loads (initial hydrate, applying code, paste theming) run
 * inside `withoutSourceUnlock` so they do not count as canvas edits.
 */
let suppressDepth = 0;

export function withoutSourceUnlock<T>(fn: () => T): T {
	suppressDepth++;
	try {
		return fn();
	} finally {
		suppressDepth--;
	}
}

/** Unlock on the first canvas edit. Returns a cleanup function. */
export function attachSourceUnlockOnEdit(editor: Editor): () => void {
	const onUpdate = () => {
		if (suppressDepth > 0) return;
		const store = useEditorStore.getState();
		if (store.htmlLocked) store.setHtmlLocked(false);
	};
	editor.on("update", onUpdate);
	return () => {
		editor.off("update", onUpdate);
	};
}

/**
 * HTML produced by our own serializer (React Email render markers). Saved
 * copies of it are derived from the document, so loading them must not lock:
 * the document may already be newer than the saved snapshot.
 */
export function isComposedEmailHtml(html: string): boolean {
	return html.includes("<!--$-->");
}
