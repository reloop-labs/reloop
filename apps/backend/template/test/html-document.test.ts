import { describe, expect, test } from "bun:test";
import { templateConfig } from "../src/template.config";
import {
	byteLength,
	contentTypeFor,
	isFullHtmlDocument,
	parseHtmlToImageRequest,
	wrapEmailHtml,
} from "../src/utils/html-document";

const { htmlToImage: limits } = templateConfig.constants;

describe("isFullHtmlDocument", () => {
	test("detects a full HTML document", () => {
		expect(
			isFullHtmlDocument("<!DOCTYPE html><html><body>Hi</body></html>"),
		).toBe(true);
	});

	test("treats a fragment as not a full document", () => {
		expect(isFullHtmlDocument("<h1>Welcome</h1>")).toBe(false);
	});
});

describe("wrapEmailHtml", () => {
	test("leaves a full document unchanged", () => {
		const html = "<html><body><p>Hi</p></body></html>";
		expect(wrapEmailHtml(html, 640)).toBe(html);
	});

	test("wraps a fragment in a fixed-width document", () => {
		const wrapped = wrapEmailHtml("<h1>Welcome</h1>", 640);
		expect(wrapped).toContain("<!DOCTYPE html>");
		expect(wrapped).toContain("width: 640px");
		expect(wrapped).toContain("img { max-width: 100%");
		expect(wrapped).toContain("<h1>Welcome</h1>");
	});
});

describe("parseHtmlToImageRequest", () => {
	test("applies email-canvas defaults", () => {
		const parsed = parseHtmlToImageRequest({ html: "<p>Hi</p>" });
		expect(parsed.width).toBe(640);
		expect(parsed.format).toBe("png");
		expect(parsed.scale).toBe(2);
		expect(parsed.quality).toBe(80);
	});

	test("rejects empty html", () => {
		expect(() => parseHtmlToImageRequest({ html: "   " })).toThrow();
	});

	test("rejects html over the size cap", () => {
		const html = "x".repeat(limits.maxHtmlBytes + 1);
		expect(byteLength(html)).toBeGreaterThan(limits.maxHtmlBytes);
		expect(() => parseHtmlToImageRequest({ html })).toThrow();
	});

	test("rejects width outside the allowed range", () => {
		expect(() =>
			parseHtmlToImageRequest({ html: "<p>Hi</p>", width: 50 }),
		).toThrow();
		expect(() =>
			parseHtmlToImageRequest({ html: "<p>Hi</p>", width: 9000 }),
		).toThrow();
	});

	test("rejects unknown formats", () => {
		expect(() =>
			parseHtmlToImageRequest({ html: "<p>Hi</p>", format: "gif" }),
		).toThrow();
	});

	test("maps formats to content types", () => {
		expect(contentTypeFor("png")).toBe("image/png");
		expect(contentTypeFor("jpeg")).toBe("image/jpeg");
		expect(contentTypeFor("webp")).toBe("image/webp");
	});
});
