import { describe, expect, test } from "bun:test";
import { escapeHtml, fillTripleBraceVars } from "@reloop/db/template-vars";

describe("escapeHtml", () => {
	test("escapes the five HTML-significant characters", () => {
		expect(escapeHtml(`<a href="x">Tom & Jerry's</a>`)).toBe(
			"&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/a&gt;",
		);
	});

	test("leaves plain text alone", () => {
		expect(escapeHtml("Ada Lovelace")).toBe("Ada Lovelace");
	});
});

describe("fillTripleBraceVars", () => {
	const injected = '<a href="https://evil.example">Claim refund</a>';

	test("escapes values in an HTML body", () => {
		expect(
			fillTripleBraceVars(
				"<p>Hi {{{name}}}</p>",
				{ name: injected },
				{
					html: true,
				},
			),
		).toBe(
			"<p>Hi &lt;a href=&quot;https://evil.example&quot;&gt;Claim refund&lt;/a&gt;</p>",
		);
	});

	test("keeps values raw outside HTML (subject, text)", () => {
		expect(
			fillTripleBraceVars(
				"Hi {{{name}}}",
				{ name: "Tom & Jerry" },
				{
					html: false,
				},
			),
		).toBe("Hi Tom & Jerry");
	});

	test("matches whitespace inside the braces and every occurrence", () => {
		expect(
			fillTripleBraceVars("{{{ a }}}-{{{a}}}", { a: "x" }, { html: true }),
		).toBe("x-x");
	});

	test("ignores double braces", () => {
		expect(fillTripleBraceVars("{{a}}", { a: "x" }, { html: true })).toBe(
			"{{a}}",
		);
	});

	test("keeps $ sequences in values literal", () => {
		expect(
			fillTripleBraceVars("Price: {{{p}}}", { p: "$& $1 $$" }, { html: false }),
		).toBe("Price: $& $1 $$");
	});

	test("treats regex characters in names literally", () => {
		expect(
			fillTripleBraceVars(
				"{{{a.b}}} {{{axb}}}",
				{ "a.b": "1" },
				{ html: true },
			),
		).toBe("1 {{{axb}}}");
	});

	test("stringifies numbers", () => {
		expect(fillTripleBraceVars("{{{n}}} items", { n: 3 }, { html: true })).toBe(
			"3 items",
		);
	});
});
