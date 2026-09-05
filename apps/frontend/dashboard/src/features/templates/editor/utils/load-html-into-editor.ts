import { generateJSON } from "@tiptap/html";
import type { Editor } from "@tiptap/react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import {
	applyPastedEmailTheme,
	parseGlobalStylesFromHtml,
} from "#/features/templates/editor/utils/apply-pasted-email-theme";
import { sanitizeEmailHtml } from "#/features/templates/editor/utils/sanitize-email-html";
import {
	isFullEmailHtml,
	pickPastedEmailHtml,
} from "#/features/templates/editor/utils/pick-pasted-email-html";

export { isFullEmailHtml, pickPastedEmailHtml };

/** Keep the pasted string as the source of truth. Do not compose React Email over it. */
export function lockPastedHtml(rawHtml: string): void {
	const store = useEditorStore.getState();
	store.setCodeHtml(rawHtml);
	store.setHtmlLocked(true);
}

/**
 * Parse pasted/imported email HTML into the live TipTap document so slash,
 * bubble menu, and the inspector run on the same tree Resend uses.
 */
export function loadHtmlIntoEditor(
	editor: Editor,
	rawHtml: string,
	options?: { emitUpdate?: boolean },
): boolean {
	const emitUpdate = options?.emitUpdate ?? true;
	if (isFullEmailHtml(rawHtml)) {
		lockPastedHtml(rawHtml);
	}
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

type HtmlSource = {
	renderedHtml?: unknown;
	content?: unknown;
	isMajor?: boolean;
};

function htmlFromSource(source: HtmlSource | undefined): string {
	if (!source) return "";
	if (typeof source.renderedHtml === "string" && source.renderedHtml.trim()) {
		return source.renderedHtml;
	}
	const content = source.content;
	if (Array.isArray(content)) {
		const first = content[0] as { html?: unknown } | undefined;
		if (typeof first?.html === "string" && first.html.trim()) {
			return first.html;
		}
	}
	if (typeof content === "string" && content.trim()) return content;
	return "";
}

export function pickSavedEmailHtml(
	template: HtmlSource & { status?: string },
	versions: HtmlSource[],
): string {
	const published =
		template.status === "published"
			? versions.find((version) => version.isMajor)
			: undefined;
	return (
		htmlFromSource(published) ||
		htmlFromSource(versions[0]) ||
		htmlFromSource(template)
	);
}

/**
 * Yjs already has the TipTap doc after a refresh, so initialize skips
 * sanitizing HTML. The imported stylesheet still has to come back or
 * the canvas loses fonts and the session-only centering tag.
 */
export function restoreImportedEmailCssFromHtml(html: string): void {
	const trimmed = html.trim();
	if (!trimmed) {
		applyImportedEmailCss("");
		return;
	}
	if (isFullEmailHtml(trimmed)) lockPastedHtml(trimmed);
	else useEditorStore.getState().setCodeHtml(trimmed);

	const parsed = parseGlobalStylesFromHtml(trimmed);
	applyImportedEmailCss(parsed.css ?? "");
	if (parsed.css) {
		useEditorStore.getState().setImportedEmailCss(parsed.css);
	}
}
