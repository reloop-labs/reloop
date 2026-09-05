import { generateJSON } from "@tiptap/html";
import type { Editor } from "@tiptap/react";
import { applyPastedEmailTheme } from "./apply-pasted-email-theme";
import { isFullEmailHtml, pickPastedEmailHtml } from "./pick-pasted-email-html";
import { sanitizeEmailHtml } from "./sanitize-email-html";
import { useEmailHtmlEditorStore } from "./store";

export { isFullEmailHtml, pickPastedEmailHtml };

/**
 * Parse pasted or typed email HTML into the live TipTap document.
 * `<>` keeps the string the user just provided (Option B).
 */
export function loadHtmlIntoEditor(
	editor: Editor,
	rawHtml: string,
	options?: { emitUpdate?: boolean },
): boolean {
	const emitUpdate = options?.emitUpdate ?? false;
	useEmailHtmlEditorStore.getState().setCodeHtml(rawHtml);
	useEmailHtmlEditorStore.getState().setApplyingFromSource(true);
	try {
		const safeHtml = sanitizeEmailHtml(rawHtml);
		const jsonDoc = generateJSON(
			safeHtml,
			editor.extensionManager.extensions as never,
		);
		if (isFullEmailHtml(rawHtml) || editor.isEmpty) {
			editor.commands.setContent(jsonDoc, { emitUpdate });
		} else {
			editor.commands.insertContent(jsonDoc);
		}

		if (isFullEmailHtml(rawHtml)) {
			applyPastedEmailTheme(editor, rawHtml);
		}
		return true;
	} catch (err) {
		console.error("Failed to load HTML into editor:", err);
		return false;
	} finally {
		window.setTimeout(() => {
			useEmailHtmlEditorStore.getState().setApplyingFromSource(false);
		}, 300);
	}
}

export function handleEmailHtmlPaste(
	editor: Editor | null,
	event: ClipboardEvent,
): boolean {
	if (!editor) return false;
	if (event.clipboardData?.files?.[0]) return false;
	const html = pickPastedEmailHtml(
		event.clipboardData?.getData("text/html") || "",
		event.clipboardData?.getData("text/plain") || "",
	);
	if (!html) return false;
	event.preventDefault();
	return loadHtmlIntoEditor(editor, html);
}
