import { describe, expect, it } from "vitest";
import { isPlainTextDocument, plainTextFromDocument } from "./plain-text-email";

const p = (...content: object[]) => ({ type: "paragraph", content });
const text = (value: string, marks?: object[]) => ({
	type: "text",
	text: value,
	...(marks ? { marks } : {}),
});
const doc = (...content: object[]) => ({ type: "doc", content });

describe("isPlainTextDocument", () => {
	it("accepts unformatted paragraphs and hard breaks", () => {
		expect(
			isPlainTextDocument(
				doc(
					p(text("Hi Sam,")),
					p(),
					p(text("Line one"), { type: "hardBreak" }, text("Line two")),
				),
			),
		).toBe(true);
	});

	it("accepts default editor attrs", () => {
		expect(
			isPlainTextDocument(
				doc({
					type: "paragraph",
					attrs: { alignment: "left", class: "", style: "" },
					content: [text("hey")],
				}),
			),
		).toBe(true);
	});

	it("rejects marks, headings, lists, links and alignment", () => {
		expect(isPlainTextDocument(doc(p(text("hey", [{ type: "bold" }]))))).toBe(
			false,
		);
		expect(
			isPlainTextDocument(
				doc(p(text("site", [{ type: "link", attrs: { href: "x" } }]))),
			),
		).toBe(false);
		expect(
			isPlainTextDocument(
				doc({ type: "heading", attrs: { level: 1 }, content: [text("T")] }),
			),
		).toBe(false);
		expect(
			isPlainTextDocument(
				doc({ type: "bulletList", content: [{ type: "listItem" }] }),
			),
		).toBe(false);
		expect(
			isPlainTextDocument(
				doc({
					type: "paragraph",
					attrs: { alignment: "center" },
					content: [text("hey")],
				}),
			),
		).toBe(false);
	});
});

describe("plainTextFromDocument", () => {
	it("separates paragraphs with a blank line and keeps hard breaks", () => {
		expect(
			plainTextFromDocument(
				doc(
					p(text("Hi Sam,")),
					p(text("Line one"), { type: "hardBreak" }, text("Line two")),
					p(text("Thanks")),
				),
			),
		).toBe("Hi Sam,\n\nLine one\nLine two\n\nThanks");
	});

	it("collapses runs of empty paragraphs and trims", () => {
		expect(
			plainTextFromDocument(
				doc(p(), p(text("a")), p(), p(), p(text("b")), p()),
			),
		).toBe("a\n\nb");
	});
});
