import { composeReactEmail } from "@react-email/editor/core";
import type { Editor } from "@tiptap/react";
import { useEditorStore } from "#/features/templates/editor/hooks/use-editor-store";

/**
 * Pasted source HTML, when the code editor is the source of truth.
 * Callers that send/test templates should prefer this over composing
 * from the visual conversion.
 */
export function getLockedSourceHtml(): string | null {
	const { htmlLocked, codeHtml } = useEditorStore.getState();
	if (htmlLocked && codeHtml.trim()) return codeHtml;
	return null;
}

/**
 * Compile the visual editor document into sendable email HTML
 * (tables, inline styles, img widths). `editor.getHTML()` is the
 * on-canvas markup and is not what clients or screenshots should use.
 */
export async function getRenderedEmailHtml(
	editor: Editor,
	previewText?: string,
): Promise<string> {
	const result = await composeReactEmail({
		editor,
		preview: previewText || undefined,
	});
	return result.html;
}
