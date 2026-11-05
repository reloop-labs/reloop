// @vitest-environment jsdom

import { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { afterEach, describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import { handleEmailHtmlPaste } from "./load-html-into-editor";

function pasteEvent(text: string): ClipboardEvent {
	const data: Record<string, string> = { "text/plain": text };
	return {
		clipboardData: {
			files: [],
			getData: (type: string) => data[type] ?? "",
		},
		preventDefault: () => {},
	} as unknown as ClipboardEvent;
}

function linkedTexts(editor: Editor): string[] {
	const out: string[] = [];
	editor.state.doc.descendants((node) => {
		if (node.isText && node.marks.some((m) => m.type.name === "link"))
			out.push(node.text ?? "");
	});
	return out;
}

let editor: Editor;
afterEach(() => editor?.destroy());

describe("pasting a link over a selection", () => {
	it("does not turn a multi-block selection into one big link", () => {
		editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<h1>Title</h1><p>Body text</p>",
		});
		editor.commands.selectAll();
		const handled = handleEmailHtmlPaste(
			editor as never,
			pasteEvent("someone@example.com"),
		);
		expect(handled).toBe(true);
		expect(linkedTexts(editor)).toEqual([]);
		expect(editor.state.doc.textContent).toBe("someone@example.com");
	});

	it("leaves a selection inside one paragraph to the normal link paste", () => {
		editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<p>Read the docs</p>",
		});
		editor.view.dispatch(
			editor.state.tr.setSelection(
				TextSelection.create(editor.state.doc, 10, 14),
			),
		);
		expect(
			handleEmailHtmlPaste(editor as never, pasteEvent("https://reloop.sh")),
		).toBe(false);
	});

	it("ignores ordinary text pasted over several blocks", () => {
		editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<p>One</p><p>Two</p>",
		});
		editor.commands.selectAll();
		expect(
			handleEmailHtmlPaste(editor as never, pasteEvent("hello there")),
		).toBe(false);
	});
});
