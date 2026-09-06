// @vitest-environment jsdom

import { Editor, Node } from "@tiptap/core";
import { generateJSON } from "@tiptap/html";
import { NodeSelection } from "@tiptap/pm/state";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	applySelectionFontColor,
	applyTextAlignment,
	displayLineHeightPercent,
	formatInspectorStyleForCss,
	getAncestorInlineStyleProp,
	getComputedSelectionColor,
	getResolvedAlignment,
	getSelectionMarkColor,
	getThemeColorFallback,
	normalizeColorToHex,
	normalizeFontWeightDisplay,
	numericPxFromCss,
	resolveInspectorTextStyle,
	setInlineCssDeclaration,
	setInlineCssProp,
	stripHorizontalAlignCss,
	valueFromInlineCss,
} from "./resolve-inspector-text-style";

const DITHER_LINK_STYLE =
	"color:rgb(255,255,255);text-decoration:underline;font-size:15px;line-height:1.5;letter-spacing:-0.075px;font-weight:450";

describe("resolveInspectorTextStyle", () => {
	it("reads Dither link font size, line height, tracking, and color", () => {
		expect(valueFromInlineCss(DITHER_LINK_STYLE, "fontSize")).toBe(15);
		expect(valueFromInlineCss(DITHER_LINK_STYLE, "lineHeight")).toBe(150);
		expect(valueFromInlineCss(DITHER_LINK_STYLE, "letterSpacing")).toBe(-0.075);
		expect(valueFromInlineCss(DITHER_LINK_STYLE, "color")).toBe("#ffffff");
	});

	it("prefers the link mark over empty parent paragraph styles", () => {
		expect(
			resolveInspectorTextStyle({
				prop: "fontSize",
				parentValue: undefined,
				linkCss: DITHER_LINK_STYLE,
			}),
		).toBe(15);
		expect(
			resolveInspectorTextStyle({
				prop: "color",
				parentValue: "#000000",
				linkCss: DITHER_LINK_STYLE,
			}),
		).toBe("#ffffff");
	});

	it("writes line-height percent back as a unitless ratio", () => {
		expect(formatInspectorStyleForCss("lineHeight", 150)).toBe("1.5");
		expect(formatInspectorStyleForCss("fontSize", 15)).toBe("15px");
	});

	it("keeps other link CSS when updating font size", () => {
		const next = setInlineCssProp(DITHER_LINK_STYLE, "fontSize", 18);
		expect(next).toContain("font-size: 18px");
		expect(next).toContain("color: rgb(255,255,255)");
		expect(next).toContain("letter-spacing: -0.075px");
	});

	it("reads CTA padding from the link mark", () => {
		expect(
			numericPxFromCss("padding-top:12px;padding-right:20px;background-color:#000", "paddingTop"),
		).toBe(12);
		expect(numericPxFromCss("padding-right:20px", "paddingRight")).toBe(20);
	});

	it("writes a CTA fill onto the link mark without dropping color", () => {
		const next = setInlineCssDeclaration(
			"color:#ffffff;padding:12px 20px;background-color:#000000",
			"backgroundColor",
			"#2563eb",
		);
		expect(next).toContain("background-color: #2563eb");
		expect(next).toContain("color: #ffffff");
		expect(next).toContain("padding: 12px 20px");
	});

	it("paints a selected word instead of only the parent paragraph", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content:
				"<p>Thank you for signing up for <strong>Barebones</strong>.</p>",
		});
		let from = 0;
		let to = 0;
		editor.state.doc.descendants((node, pos) => {
			if (!node.isText || !node.text?.includes("Barebones")) return;
			const offset = node.text.indexOf("Barebones");
			from = pos + offset;
			to = from + "Barebones".length;
			return false;
		});
		editor.commands.setTextSelection({ from, to });
		expect(applySelectionFontColor(editor, "#912222")).toBe(true);
		const html = editor.getHTML();
		expect(html).toMatch(/data-email-font-color/);
		expect(html).toMatch(/#912222|rgb\(\s*145\s*,\s*34\s*,\s*34\s*\)/);
		expect(html).toContain("Barebones");
		editor.destroy();
	});

	it("keeps Dither CTA typography on the TipTap link mark", () => {
		const html = `<p><a href="https://example.com/" style="${DITHER_LINK_STYLE}"><u>Invite Teammates</u></a></p>`;
		const json = JSON.stringify(
			generateJSON(html, [emailStarterKit()] as never),
		);
		expect(json).toContain('"type":"link"');
		expect(json).toMatch(/font-size:\s*15px/);
		expect(json).toMatch(/letter-spacing:\s*-0\.075px/);
	});

	it("reads and formats fontFamily and fontWeight from inline CSS", () => {
		const css = "font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-weight: 600";
		expect(valueFromInlineCss(css, "fontFamily")).toContain("Plus Jakarta Sans");
		expect(valueFromInlineCss(css, "fontWeight")).toBe("600");

		const updated = setInlineCssProp(css, "fontWeight", "700");
		expect(updated).toContain("font-weight: 700");
		expect(updated).toContain("font-family: 'Plus Jakarta Sans', Arial, sans-serif");
	});

	it("resolves alignment prioritizing inline text-align style", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<p style="text-align: right; color: #c14e4e;">Barebones</p>`,
		});
		editor.commands.setTextSelection({ from: 1, to: 9 });
		expect(getResolvedAlignment(editor)).toBe("right");
		editor.destroy();
	});

	it("applyTextAlignment updates textblock and enclosing tableCell, syncing inline style and attributes", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<table><tbody><tr><td style="text-align: right;" alignment="right"><p style="text-align: right; color: #c14e4e;">Barebones</p></td></tr></tbody></table>`,
		});
		let from = 0;
		let to = 0;
		editor.state.doc.descendants((node, pos) => {
			if (!node.isText || !node.text?.includes("Barebones")) return;
			from = pos;
			to = pos + node.nodeSize;
			return false;
		});
		editor.commands.setTextSelection({ from, to });

		// Before: isActive("right") is true
		expect(editor.isActive({ alignment: "right" })).toBe(true);

		// Apply alignment left
		expect(applyTextAlignment(editor, "left")).toBe(true);

		// Now: isActive("left") is true, isActive("right") is false
		expect(editor.isActive({ alignment: "left" })).toBe(true);
		expect(editor.isActive({ alignment: "right" })).toBe(false);

		// Inspector resolver returns "left"
		expect(getResolvedAlignment(editor)).toBe("left");

		// HTML markup has text-align: left and alignment="left" on both paragraph and cell
		const html = editor.getHTML();
		expect(html).toContain("text-align: left");
		expect(html).not.toMatch(/text-align:\s*right/);

		editor.destroy();
	});

	it("applyTextAlignment preserves vertical placement on the cell", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<table><tbody><tr><td style="text-align: right; vertical-align: middle;" valign="middle" alignment="right"><p style="text-align: right;">Barebones</p></td></tr></tbody></table>`,
		});
		let from = 0;
		let to = 0;
		editor.state.doc.descendants((node, pos) => {
			if (!node.isText || !node.text?.includes("Barebones")) return;
			from = pos;
			to = pos + node.nodeSize;
			return false;
		});
		editor.commands.setTextSelection({ from, to });
		expect(applyTextAlignment(editor, "left")).toBe(true);

		const html = editor.getHTML();
		expect(html).toContain("text-align: left");
		// valign attr (schema-supported) must survive a horizontal-align change
		expect(html).toContain('valign="middle"');
		expect(html).not.toMatch(/vertical-\s*;/);
		expect(html).not.toMatch(/text-\s*;/);

		editor.destroy();
	});

	it("normalizes colors to hex for inspector display", () => {
		expect(normalizeColorToHex("rgb(255, 255, 255)")).toBe("#ffffff");
		expect(normalizeColorToHex("rgba(0, 0, 0, 1)")).toBe("#000000");
		expect(normalizeColorToHex("#fff")).toBe("#ffffff");
		expect(normalizeColorToHex("#123456")).toBe("#123456");
		expect(normalizeColorToHex("")).toBe("");
		expect(normalizeColorToHex(undefined)).toBe("");
	});

	it("normalizes font-weight keywords for inspector display", () => {
		expect(normalizeFontWeightDisplay("bold")).toBe("700");
		expect(normalizeFontWeightDisplay("normal")).toBe("400");
		expect(normalizeFontWeightDisplay("600")).toBe("600");
		expect(normalizeFontWeightDisplay("")).toBe("");
	});

	it("displays unitless line-height ratios as percent", () => {
		expect(displayLineHeightPercent(1.5)).toBe(150);
		expect(displayLineHeightPercent("1.5")).toBe(150);
		expect(displayLineHeightPercent("150%")).toBe(150);
		expect(displayLineHeightPercent(150)).toBe(150);
		expect(displayLineHeightPercent("20px", 10)).toBe(200);
		expect(displayLineHeightPercent("")).toBe("");
		expect(displayLineHeightPercent(undefined)).toBe("");
	});

	it("reads color marks covering the selection", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<p>Hello Barebones</p>",
		});
		let from = 0;
		let to = 0;
		editor.state.doc.descendants((node, pos) => {
			if (!node.isText || !node.text?.includes("Barebones")) return;
			from = pos;
			to = pos + node.nodeSize;
			return false;
		});
		editor.commands.setTextSelection({ from, to });
		expect(applySelectionFontColor(editor, "#912222")).toBe(true);
		expect(getSelectionMarkColor(editor)).toBe("#912222");
		editor.destroy();
	});

	it("returns empty mark color for mixed or missing marks", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: "<p>Hello Barebones</p>",
		});
		editor.commands.setTextSelection({ from: 1, to: 5 });
		expect(getSelectionMarkColor(editor)).toBe("");
		expect(getThemeColorFallback(editor)).toBeUndefined();
		expect(getComputedSelectionColor(editor)).toBe("");
		editor.destroy();
	});

	it("inherits text color from ancestor cells when the block has none", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<table><tbody><tr><td style="color: #6b7280;"><p>Barebones</p></td></tr></tbody></table>`,
		});
		let from = 0;
		let to = 0;
		editor.state.doc.descendants((node, pos) => {
			if (!node.isText || !node.text?.includes("Barebones")) return;
			from = pos;
			to = pos + node.nodeSize;
			return false;
		});
		editor.commands.setTextSelection({ from, to });
		expect(getAncestorInlineStyleProp(editor, "color")).toBe("#6b7280");
		editor.destroy();
	});

	it("stripHorizontalAlignCss leaves vertical-align untouched", () => {
		expect(
			stripHorizontalAlignCss(
				"text-align: right; vertical-align: middle; color: #000;",
			),
		).toContain("vertical-align: middle");
		expect(
			stripHorizontalAlignCss(
				"text-align: right; vertical-align: middle; color: #000;",
			),
		).not.toMatch(/text-align/);
		expect(stripHorizontalAlignCss("align: center; margin: 0;")).not.toMatch(
			/align/,
		);
	});

	it("resolves strictly to textblock alignment when nested in table and cell with different alignments", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<table alignment="center"><tbody><tr><td alignment="right"><h1 style="text-align: left;">We're almost there!</h1></td></tr></tbody></table>`,
		});
		let from = 0;
		let to = 0;
		editor.state.doc.descendants((node, pos) => {
			if (!node.isText || !node.text?.includes("We're almost there!")) return;
			from = pos;
			to = pos + node.nodeSize;
			return false;
		});
		editor.commands.setTextSelection({ from, to });

		// getResolvedAlignment strictly returns "left", not "center" or "right"
		const resolved = getResolvedAlignment(editor);
		expect(resolved).toBe("left");

		// Mutually exclusive active state check:
		expect(resolved === "left").toBe(true);
		expect(resolved === "center").toBe(false);
		expect(resolved === "right").toBe(false);

		editor.destroy();
	});

	it("clicking a button node establishes a NodeSelection on the button", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `
				<p>Hello</p>
				<div class="align-center">
					<a class="node-button button" style="background-color: #000; padding: 12px 20px;" data-id="react-email-button" href="https://example.com">
						<span>Confirm email</span>
					</a>
				</div>
			`,
		});

		let buttonPos: number | null = null;
		let buttonTextPos: number | null = null;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "button") {
				buttonPos = pos;
			}
			if (node.isText && node.text?.includes("Confirm email")) {
				buttonTextPos = pos;
			}
		});

		expect(buttonPos).not.toBeNull();
		expect(buttonTextPos).not.toBeNull();

		// Simulate clicking inside the button text
		const event = new MouseEvent("click");
		const handled = editor.view.someProp("handleClick", (f) =>
			f(editor.view, buttonTextPos!, event),
		);

		expect(handled).toBe(true);
		expect(editor.state.selection instanceof NodeSelection).toBe(true);
		if (editor.state.selection instanceof NodeSelection) {
			expect(editor.state.selection.node.type.name).toBe("button");
			expect(editor.state.selection.from).toBe(buttonPos);
		}

		editor.destroy();
	});

	it("resolves and applies alignment on button node selection", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `<div class="align-left"><a class="node-button button" alignment="left" data-id="react-email-button" href="https://example.com"><span>Click me</span></a></div>`,
		});

		let buttonPos = 0;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "button") buttonPos = pos;
		});
		editor.commands.setNodeSelection(buttonPos);

		expect(getResolvedAlignment(editor)).toBe("left");

		applyTextAlignment(editor, "center");
		expect(getResolvedAlignment(editor)).toBe("center");
		const buttonNode = editor.state.doc.nodeAt(buttonPos);
		expect(buttonNode?.attrs.alignment).toBe("center");

		editor.destroy();
	});

	it("resolves and applies alignment on image node selection", () => {
		const ImageNode = Node.create({
			name: "image",
			group: "block",
			atom: true,
			draggable: true,
			addAttributes() {
				return {
					src: { default: "" },
					alt: { default: "" },
					width: { default: "auto" },
					height: { default: "auto" },
					alignment: {
						default: "center",
						parseHTML: (element) =>
							element.getAttribute("alignment") ||
							element.getAttribute("align") ||
							"center",
					},
					href: { default: null },
					style: {
						default: null,
						parseHTML: (element) => element.getAttribute("style"),
					},
				};
			},
			parseHTML() {
				return [{ tag: "img[src]" }];
			},
			renderHTML({ HTMLAttributes }) {
				return ["img", HTMLAttributes];
			},
		});

		const editor = new Editor({
			extensions: [emailStarterKit(), ImageNode],
			content: `<img src="https://example.com/logo.png" alignment="center" style="display: block; margin-left: auto; margin-right: auto;" />`,
		});

		let imgPos = -1;
		editor.state.doc.descendants((node, pos) => {
			if (node.type.name === "image") {
				imgPos = pos;
			}
		});
		expect(imgPos).toBeGreaterThanOrEqual(0);
		editor.commands.setNodeSelection(imgPos);
		expect(getResolvedAlignment(editor)).toBe("center");

		applyTextAlignment(editor, "left");
		expect(getResolvedAlignment(editor)).toBe("left");
		const imgNode = editor.state.doc.nodeAt(imgPos);
		expect(imgNode?.attrs.alignment).toBe("left");
		expect(imgNode?.attrs.style).toContain("margin-right: auto");
		expect(imgNode?.attrs.style).not.toContain("margin-left: auto");

		editor.destroy();
	});

	it("keeps text paragraph left-aligned even when a sibling button in the same cell has alignment", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `
				<table>
					<tbody>
						<tr>
							<td style="padding: 10px;">
								<p>Hello feature. Goodbye old feature.</p>
								<div class="align-left"><a class="node-button button" alignment="left" data-id="react-email-button" href="https://example.com"><span>Try it out</span></a></div>
							</td>
						</tr>
					</tbody>
				</table>
			`,
		});

		let pPos = 0;
		editor.state.doc.descendants((node, pos) => {
			if (node.isText && node.text?.includes("Hello feature")) pPos = pos;
		});
		editor.commands.setTextSelection(pPos);

		expect(getResolvedAlignment(editor)).toBe("left");
		editor.destroy();
	});

	it("resolves and applies alignment on bullet lists and blockquotes", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `
				<ul alignment="left"><li><p>Item 1</p></li></ul>
				<blockquote alignment="left"><p>Quote 1</p></blockquote>
			`,
		});

		let itemPos = 0;
		editor.state.doc.descendants((node, pos) => {
			if (node.isText && node.text?.includes("Item 1")) itemPos = pos;
		});
		editor.commands.setTextSelection(itemPos);
		expect(getResolvedAlignment(editor)).toBe("left");

		applyTextAlignment(editor, "center");
		expect(getResolvedAlignment(editor)).toBe("center");

		editor.destroy();
	});

	it("inherits alignment from enclosing table when cell has no explicit alignment", () => {
		const editor = new Editor({
			extensions: [emailStarterKit()],
			content: `
				<table alignment="center" style="max-width: 422px; text-align: center;">
					<tbody>
						<tr>
							<td>
								<p>What's new from Barebones</p>
								<h1>Release Notes</h1>
							</td>
						</tr>
					</tbody>
				</table>
				<table alignment="left" style="text-align: left;">
					<tbody>
						<tr>
							<td>
								<p>Hello feature. Goodbye old feature.</p>
							</td>
						</tr>
					</tbody>
				</table>
			`,
		});

		let releasePos = 0;
		let helloPos = 0;
		editor.state.doc.descendants((node, pos) => {
			if (node.isText && node.text?.includes("Release Notes")) releasePos = pos;
			if (node.isText && node.text?.includes("Hello feature")) helloPos = pos;
		});

		editor.commands.setTextSelection(releasePos);
		expect(getResolvedAlignment(editor)).toBe("center");

		editor.commands.setTextSelection(helloPos);
		expect(getResolvedAlignment(editor)).toBe("left");

		editor.destroy();
	});
});

