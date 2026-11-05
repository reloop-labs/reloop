import { generateJSON } from "@tiptap/html";
import type { Editor } from "@tiptap/react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";
import { applyImportedEmailCss } from "#/features/templates/editor/utils/apply-imported-email-css";
import {
	applyPastedEmailTheme,
	parseGlobalStylesFromHtml,
} from "#/features/templates/editor/utils/apply-pasted-email-theme";
import {
	isComposedEmailHtml,
	withoutSourceUnlock,
} from "#/features/templates/editor/utils/html-source-lock";
import {
	isFullEmailHtml,
	pickPastedEmailHtml,
} from "#/features/templates/editor/utils/pick-pasted-email-html";
import { sanitizeEmailHtml } from "#/features/templates/editor/utils/sanitize-email-html";

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
	const isFullEmail = isFullEmailHtml(rawHtml);
	try {
		const safeHtml = sanitizeEmailHtml(rawHtml);
		const jsonDoc = generateJSON(
			safeHtml,
			editor.extensionManager.extensions as never,
		);
		if (isFullEmail) {
			// A whole email replaces the document and becomes the sent source.
			withoutSourceUnlock(() => {
				editor.commands.setContent(jsonDoc, { emitUpdate });
			});
			lockPastedHtml(rawHtml);
			applyPastedEmailTheme(editor, rawHtml);
		} else if (editor.isEmpty) {
			editor.commands.setContent(jsonDoc, { emitUpdate });
		} else {
			// A snippet is a canvas edit like any other.
			editor.commands.insertContent(jsonDoc);
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
	if (pasteLinkOverBlocks(editor, event)) return true;
	const html = pickPastedEmailHtml(
		event.clipboardData?.getData("text/html") || "",
		event.clipboardData?.getData("text/plain") || "",
	);
	if (!html) return false;
	event.preventDefault();
	return loadHtmlIntoEditor(editor, html);
}

/** A lone URL, email address or bare domain, e.g. copied from an address bar. */
function isLinkLikeText(text: string): boolean {
	if (!text || /\s/.test(text)) return false;
	return (
		/^[a-z][\w+.-]*:\S+$/i.test(text) ||
		/^[^@]+@[^@]+\.[^@]+$/.test(text) ||
		/^(www\.)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i.test(text)
	);
}

/**
 * Pasting a URL or email over selected text turns that text into a link
 * (TipTap's linkOnPaste). Fine inside one paragraph, but with several blocks
 * selected (Cmd+A) it silently linked the whole email. Across blocks, paste
 * the text like any other paste instead.
 */
function pasteLinkOverBlocks(editor: Editor, event: ClipboardEvent): boolean {
	const { selection } = editor.state;
	if (selection.empty) return false;
	// Within one paragraph keep the link paste. Select-all sits at the doc
	// level, so its ends share a parent that is not a text block.
	const { $from, $to } = selection;
	if ($from.sameParent($to) && $from.parent.isTextblock) return false;
	const text = event.clipboardData?.getData("text/plain")?.trim() ?? "";
	if (!isLinkLikeText(text)) return false;
	event.preventDefault();
	editor.view.dispatch(editor.state.tr.insertText(text).scrollIntoView());
	return true;
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
	// Only hand-pasted source is authoritative; a saved render of our own
	// document may be older than the live (Yjs) document, so the code view
	// recomposes it instead.
	if (isFullEmailHtml(trimmed) && !isComposedEmailHtml(trimmed)) {
		lockPastedHtml(trimmed);
	}

	const parsed = parseGlobalStylesFromHtml(trimmed);
	applyImportedEmailCss(parsed.css ?? "");
	if (parsed.css) {
		useEditorStore.getState().setImportedEmailCss(parsed.css);
	}
}
