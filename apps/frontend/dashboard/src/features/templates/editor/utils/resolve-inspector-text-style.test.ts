// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	formatInspectorStyleForCss,
	resolveInspectorTextStyle,
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
