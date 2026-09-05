// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateHTML, generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	cssHasPaintedBackground,
	cssPaintedBackgroundValue,
	EMAIL_DECORATION_ATTR,
	preserveEmailLinkUnderlines,
	stampFilledLinksAsEmailButtons,
} from "./preserve-email-link-underlines";

const DITHER_SETUP_LINK = `
<p>
  <a href="https://example.com/" style="color:rgb(255,255,255);text-decoration-line:none;text-decoration:underline;font-size:15px;font-weight:450">
    <u>Complete Setup</u>
  </a>
</p>
<p>visit our <a href="https://example.com/" style="color:rgb(74,74,74);text-decoration:underline"><u>Help Center</u></a>.</p>
`;

const ARCANE_LINKS = `
<a href="https://example.com/" style="color:rgb(48,6,16);text-decoration-line:none;font-size:16px;font-weight:500">Start Exploring →</a>
<p style="font-size:11px;max-width:169px">
	<a href="https://example.com/" style="color:rgb(239,225,216);text-decoration-line:none">Unsubscribe</a>
	from Skin marketing emails.
</p>
`;

function roundTrip(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	preserveEmailLinkUnderlines(doc.body);
	const json = generateJSON(doc.body.innerHTML, [emailStarterKit()] as never);
	return generateHTML(json, [emailStarterKit()] as never);
}

describe("preserveEmailLinkUnderlines", () => {
	it("keeps Dither CTA and Help Center underlines", () => {
		const doc = new DOMParser().parseFromString(DITHER_SETUP_LINK, "text/html");
		preserveEmailLinkUnderlines(doc.body);

		const links = Array.from(doc.querySelectorAll("a"));
		expect(links).toHaveLength(2);
		for (const link of links) {
			expect(link.style.textDecoration).toContain("underline");
			expect(link.style.textDecorationLine).not.toBe("none");
			expect(link.getAttribute(EMAIL_DECORATION_ATTR)).toBe("underline");
		}
	});

	it("keeps the link mark and underline in the TipTap document", () => {
		const html = roundTrip(DITHER_SETUP_LINK);

		expect(html).toContain("Complete Setup");
		expect(html).toContain("https://example.com/");
		expect(html).toMatch(/data-email-decoration="underline"/);
		expect(html).toMatch(/underline/i);
	});

	it("keeps Arcane Start Exploring and Unsubscribe without an underline", () => {
		const doc = new DOMParser().parseFromString(ARCANE_LINKS, "text/html");
		preserveEmailLinkUnderlines(doc.body);

		for (const link of Array.from(doc.querySelectorAll("a"))) {
			expect(link.style.textDecoration).toBe("none");
			expect(link.getAttribute(EMAIL_DECORATION_ATTR)).toBe("none");
		}

		const html = roundTrip(ARCANE_LINKS);
		expect(html).toContain("Start Exploring");
		expect(html).toContain("Unsubscribe");
		expect(html).toMatch(/data-email-decoration="none"/);
		expect(html).not.toMatch(/data-email-decoration="underline"/);
	});

	it("does not underline a filled button-like link", () => {
		const html = `<a href="https://example.com/" style="display:inline-block;background-color:rgb(255,255,255);color:rgb(0,0,0);padding:12px 20px">Explore</a>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		preserveEmailLinkUnderlines(doc.body);
		const link = doc.querySelector("a");
		expect(link?.getAttribute(EMAIL_DECORATION_ATTR)).toBe("none");
		expect(link?.style.textDecoration).toBe("none");
	});

	it("stamps a padded filled CTA as a React Email button", () => {
		const html = `<a href="https://example.com/" style="display:inline-block;background-color:#000;color:#fff;padding:12px 20px">Confirm email</a>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		stampFilledLinksAsEmailButtons(doc.body);
		expect(doc.querySelector("a")?.getAttribute("data-id")).toBe(
			"react-email-button",
		);
	});

	it("stamps a CTA that uses background shorthand", () => {
		const html = `<a href="https://example.com/" style="background:#111;padding:12px 20px">Confirm email</a>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		stampFilledLinksAsEmailButtons(doc.body);
		expect(doc.querySelector("a")?.getAttribute("data-id")).toBe(
			"react-email-button",
		);
	});

	it("stamps a Tailwind bg-/px-/py- CTA before styles are inlined", () => {
		const html = `<a href="https://example.com/" class="bg-black px-6 py-3 text-white">Confirm email</a>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		stampFilledLinksAsEmailButtons(doc.body);
		expect(doc.querySelector("a")?.getAttribute("data-id")).toBe(
			"react-email-button",
		);
	});

	it("reads a painted CTA fill from inline CSS for inspect", () => {
		expect(
			cssHasPaintedBackground(
				"display:inline-block;background-color:#000000;padding:12px 20px",
			),
		).toBe(true);
		expect(cssPaintedBackgroundValue("background-color:#000000")).toMatch(
			/#000000|rgb\(0,\s*0,\s*0\)/i,
		);
		expect(cssHasPaintedBackground("color:#0066ff;text-decoration:underline")).toBe(
			false,
		);
	});

	it("does not stamp an underlined text link as a button", () => {
		const html = `<a href="https://example.com/" style="color:#0066ff;text-decoration:underline">Help Center</a>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		stampFilledLinksAsEmailButtons(doc.body);
		expect(doc.querySelector("a")?.getAttribute("data-id")).toBeNull();
	});

	it("does not underline image links", () => {
		const html = `<a href="https://x.com/"><img width="20" height="20" alt="X" /></a>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		preserveEmailLinkUnderlines(doc.body);
		const link = doc.querySelector("a");
		expect(link?.getAttribute(EMAIL_DECORATION_ATTR)).toBe("none");
		expect(link?.style.textDecoration).toBe("none");
	});
});

describe("email canvas link decoration CSS", () => {
	const css = readFileSync(
		join(
			dirname(fileURLToPath(import.meta.url)),
			"../components/canvas/email-canvas.css",
		),
		"utf8",
	).replace(/\/\*[\s\S]*?\*\//g, "");

	it("stamps source underline/none instead of forcing every link to none", () => {
		expect(css).toMatch(/\[data-email-decoration=["']underline["']\]/);
		expect(css).toMatch(/\[data-email-decoration=["']none["']\]/);
		expect(css).not.toMatch(
			/\.node-link[\s,{][^}]*text-decoration:\s*none\s*!important/,
		);
	});
});
