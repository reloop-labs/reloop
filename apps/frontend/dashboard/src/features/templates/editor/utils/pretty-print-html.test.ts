// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { prettyPrintHtml } from "./pretty-print-html";

describe("prettyPrintHtml", () => {
	it("indents nested tables without dropping style tags or images", () => {
		const raw =
			'<!DOCTYPE html><html><head><style>.hero{display:block}</style></head><body><table align="center"><tr><td><img src="https://example.com/hero.png" alt="Hero"></td></tr></table></body></html>';

		const result = prettyPrintHtml(raw);

		expect(result).toContain("<style>");
		expect(result).toContain(".hero{display:block}");
		expect(result).toContain('src="https://example.com/hero.png"');
		expect(result).toContain('align="center"');
		expect(result).toMatch(/\n\s+<table/);
		expect(result).not.toContain("composeReactEmail");
	});

	it("does not rewrite the document into composed React Email XHTML", () => {
		const raw =
			'<!DOCTYPE html><html><body style="background:#111"><img src="https://example.com/hero.png" alt="Hero"></body></html>';
		const result = prettyPrintHtml(raw);
		expect(result).not.toMatch(/XHTML 1\.0 Transitional/i);
		expect(result).not.toContain("&#x27;");
		expect(result).toContain('src="https://example.com/hero.png"');
	});
});
