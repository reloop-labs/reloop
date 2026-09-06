// @vitest-environment jsdom

import { Editor } from "@tiptap/core";
import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	applySelectionFontColor,
	formatInspectorStyleForCss,
	numericPxFromCss,
	resolveInspectorTextStyle,
	setInlineCssDeclaration,
	setInlineCssProp,
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
		expect(json).toMatch(/line-height:\s*1\.5/);
		expect(json).toMatch(/letter-spacing:\s*-0\.075px/);
	});
});
