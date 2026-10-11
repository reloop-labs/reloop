import type { Editor } from "@tiptap/react";
import { useEditorStore } from "../hooks/use-editor-store";
import { loadHtmlIntoEditor } from "./load-html-into-editor";

const SETTLE_MS = 300;
const PLACEHOLDER = /\{\{\{?\s*([a-zA-Z0-9_]+)\s*\}?\}\}/g;

/**
 * Turn `{{name}}` / `{{{name}}}` text into variable nodes so placeholders in
 * source HTML show as chips and open the variable inspector. Skips text that
 * the paste rules already converted and text inside link marks (hrefs are
 * attributes, so only visible placeholder text is affected).
 */
function convertPlaceholdersToVariables(editor: Editor): void {
	const variableType = editor.schema.nodes.variable;
	if (!variableType) return;
	const matches: Array<{ from: number; to: number; name: string }> = [];
	editor.state.doc.descendants((node, pos) => {
		if (!node.isText || !node.text) return;
		for (const match of node.text.matchAll(PLACEHOLDER)) {
			const name = match[1];
			if (!name || match.index === undefined) continue;
			matches.push({
				from: pos + match.index,
				to: pos + match.index + match[0].length,
				name,
			});
		}
	});
	if (!matches.length) return;
	const { tr } = editor.state;
	// Replace from the end so earlier positions stay valid.
	for (const { from, to, name } of matches.reverse()) {
		const marks = editor.state.doc.resolve(from).marks();
		tr.replaceWith(from, to, variableType.create({ name }, null, marks));
	}
	editor.view.dispatch(tr);
}
let settleTimer: number | null = null;

/**
 * Load source HTML (a template or the code view) into the canvas without the
 * resulting transactions being treated as canvas edits. The source string stays
 * as the HTML of record until the user edits on the canvas.
 */
export function applySourceHtml(editor: Editor, html: string): boolean {
	const store = useEditorStore.getState();
	store.setApplyingFromSource(true);
	store.setCodeHtml(html);
	store.setHtmlLocked(true);
	if (settleTimer) window.clearTimeout(settleTimer);
	try {
		const loaded = loadHtmlIntoEditor(editor, html, { emitUpdate: false });
		if (loaded) convertPlaceholdersToVariables(editor);
		return loaded;
	} finally {
		settleTimer = window.setTimeout(() => {
			useEditorStore.getState().setApplyingFromSource(false);
		}, SETTLE_MS);
	}
}
