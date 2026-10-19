// @vitest-environment jsdom
import { describe, expect, test } from "vitest";
import { processEmailHtmlForDisplay } from "./email-html";

const render = (html: string, theme: "light" | "dark" = "dark") => {
	const { processedHtml } = processEmailHtmlForDisplay({
		html,
		shouldLoadImages: true,
		theme,
	});
	const doc = new DOMParser().parseFromString(processedHtml, "text/html");
	return doc.body;
};

describe("processEmailHtmlForDisplay dark mode", () => {
	test("lightens hard-coded dark text on the dark panel", () => {
		const body = render(
			'<table bgcolor="#ffffff"><tr><td style="background-color:#ffffff"><p style="color:#1f2937">hey,</p><a style="color:#1d4ed8" href="https://x.test">Submit</a></td></tr></table>',
		);
		const p = body.querySelector("p") as HTMLElement;
		const a = body.querySelector("a") as HTMLElement;
		const td = body.querySelector("td") as HTMLElement;
		expect(body.querySelector("table")?.hasAttribute("bgcolor")).toBe(false);
		expect(td.style.backgroundColor).toBe("transparent");
		expect(p.style.color).not.toBe("rgb(31, 41, 55)");
		expect(p.style.color).not.toBe("#1f2937");
		expect(a.style.color).not.toBe("#1d4ed8");
	});

	test("keeps brand buttons and gives them dark text when unset", () => {
		const body = render(
			'<a style="background-color:#facc15" href="https://x.test">Go</a>',
		);
		const a = body.querySelector("a") as HTMLElement;
		expect(a.style.backgroundColor).toBe("rgb(250, 204, 21)");
		expect(a.style.color).toBe("rgb(17, 17, 17)");
	});

	test("light theme leaves colors untouched", () => {
		const body = render('<p style="color:#1f2937">hey</p>', "light");
		expect((body.querySelector("p") as HTMLElement).getAttribute("style")).toBe(
			"color:#1f2937",
		);
	});
});
