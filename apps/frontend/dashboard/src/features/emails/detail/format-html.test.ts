import { describe, expect, it } from "vitest";
import { formatHtml, htmlToPlainText } from "./format-html";

describe("formatHtml", () => {
	it("returns empty string for falsy input", () => {
		expect(formatHtml("")).toBe("");
	});

	it("indents tags correctly", () => {
		const raw = "<div><p>Hello world</p></div>";
		const formatted = formatHtml(raw);
		expect(formatted).toBe("<div>\n  <p>Hello world</p>\n</div>");
	});
});

describe("htmlToPlainText", () => {
	it("returns empty string for falsy input", () => {
		expect(htmlToPlainText("")).toBe("");
	});

	it("strips HTML tags and decodes entities", () => {
		const html =
			"<div><h1>Title</h1><p>Hello &amp; welcome&nbsp;to Reloop!</p></div>";
		const text = htmlToPlainText(html);
		expect(text).toContain("Title");
		expect(text).toContain("Hello & welcome to Reloop!");
	});

	it("formats list items with bullet points", () => {
		const html = "<ul><li>Feature 1</li><li>Feature 2</li></ul>";
		const text = htmlToPlainText(html);
		expect(text).toContain("• Feature 1");
		expect(text).toContain("• Feature 2");
	});
});
