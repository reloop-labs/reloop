// @vitest-environment jsdom

import { Editor } from "@tiptap/core";
import { TextSelection } from "@tiptap/pm/state";
import { afterEach, describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";

const html = `<table><tbody>
<tr><td><p>Bloop</p></td></tr>
<tr><td><table><tbody><tr><td><p></p></td><td><p></p></td></tr></tbody></table></td></tr>
<tr><td><p></p></td></tr>
<tr><td><p>&#8203;&nbsp;</p></td></tr>
<tr><td style="border-top:1px solid #ececec;font-size:0"><p>&nbsp;</p></td></tr>
<tr><td><p>Bloop is on Discord.</p></td></tr>
<tr><td><p></p></td><td><p>Keep me</p></td></tr>
</tbody></table>`;

let editor: Editor;
afterEach(() => editor?.destroy());

function rowTexts(): string[] {
	const outer =
		editor.state.doc.firstChild?.type.name === "table"
			? editor.state.doc.firstChild
			: null;
	const rows: string[] = [];
	editor.state.doc.descendants((node, pos) => {
		if (node.type.name !== "tableRow") return true;
		if (editor.state.doc.resolve(pos).depth > (outer ? 1 : 3)) return false;
		rows.push(node.textContent);
		return false;
	});
	return rows;
}

/** Cursor into the nth empty paragraph in document order. */
function cursorInEmptyParagraph(index: number) {
	let found = -1;
	let target = -1;
	editor.state.doc.descendants((node, pos) => {
		if (target >= 0) return false;
		if (node.type.name === "paragraph" && node.content.size === 0) {
			found++;
			if (found === index) target = pos + 1;
		}
		return true;
	});
	editor.view.dispatch(
		editor.state.tr.setSelection(
			TextSelection.create(editor.state.doc, target),
		),
	);
}

describe("removing empty layout rows", () => {
	it("Backspace in an empty row removes the row", () => {
		editor = new Editor({ extensions: [emailStarterKit()], content: html });
		const before = rowTexts().length;
		cursorInEmptyParagraph(2); // the lone empty row under the logos
		expect(editor.commands.keyboardShortcut("Backspace")).toBe(true);
		expect(rowTexts().length).toBe(before - 1);
	});

	it("removes the whole row around an emptied nested table", () => {
		editor = new Editor({ extensions: [emailStarterKit()], content: html });
		const before = editor.state.doc.textContent;
		const rows = rowTexts().length;
		cursorInEmptyParagraph(0); // inside the empty logo table
		expect(editor.commands.keyboardShortcut("Delete")).toBe(true);
		expect(rowTexts().length).toBe(rows - 1);
		expect(editor.state.doc.textContent).toBe(before);
	});

	it("treats zero-width spacers from pasted HTML as empty", () => {
		editor = new Editor({ extensions: [emailStarterKit()], content: html });
		const rows = rowTexts().length;
		let target = -1;
		editor.state.doc.descendants((node, pos) => {
			if (
				target < 0 &&
				node.type.name === "paragraph" &&
				node.textContent.includes("\u200b")
			)
				target = pos + 1;
			return target < 0;
		});
		editor.commands.setTextSelection(target);
		expect(editor.commands.keyboardShortcut("Backspace")).toBe(true);
		expect(rowTexts().length).toBe(rows - 1);
	});

	it("keeps a divider row drawn only by a border", () => {
		editor = new Editor({ extensions: [emailStarterKit()], content: html });
		const rows = rowTexts().length;
		let target = -1;
		editor.state.doc.descendants((node, pos) => {
			if (
				target < 0 &&
				node.type.name === "tableCell" &&
				String(node.attrs.style ?? "").includes("border-top")
			)
				target = pos + 2;
			return target < 0;
		});
		expect(target).toBeGreaterThan(0);
		editor.commands.setTextSelection(target);
		editor.commands.keyboardShortcut("Backspace");
		expect(rowTexts().length).toBe(rows);
	});

	it("keeps a row that still has content in another cell", () => {
		editor = new Editor({ extensions: [emailStarterKit()], content: html });
		const rows = rowTexts().length;
		cursorInEmptyParagraph(3); // empty cell next to "Keep me"
		editor.commands.keyboardShortcut("Backspace");
		expect(rowTexts().length).toBe(rows);
		expect(editor.state.doc.textContent).toContain("Keep me");
	});
});
