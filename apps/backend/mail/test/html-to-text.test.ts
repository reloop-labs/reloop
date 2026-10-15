import { describe, expect, test } from "bun:test";
import { htmlToText } from "../src/lib/html-to-text";

describe("htmlToText", () => {
	test("keeps paragraph and line breaks", () => {
		expect(
			htmlToText("<p>Hi Vishnu,</p><p>Thanks<br>for reaching out</p>"),
		).toBe("Hi Vishnu,\n\nThanks\nfor reaching out");
	});

	test("drops head, style, script and comments", () => {
		const html =
			"<html><head><title>T</title><style>p{color:red}</style></head><body><!-- x --><script>alert(1)</script><p>Body</p></body></html>";
		expect(htmlToText(html)).toBe("Body");
	});

	test("matches React Email plain-text output for links and images", () => {
		expect(
			htmlToText('<a href="https://reloop.sh/docs">Read the docs</a>'),
		).toBe("Read the docs https://reloop.sh/docs");
		expect(
			htmlToText('<p>Logo <img src="x.png" alt="Logo"> &copy; 2026</p>'),
		).toBe("Logo © 2026");
		expect(
			htmlToText('<p>Hi</p><div data-skip-in-text="true">Preview</div>'),
		).toBe("Hi");
	});
});
