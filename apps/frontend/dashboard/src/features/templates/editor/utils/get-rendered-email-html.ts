import { composeReactEmail } from "@react-email/editor/core";
import type { Editor } from "@tiptap/react";

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
