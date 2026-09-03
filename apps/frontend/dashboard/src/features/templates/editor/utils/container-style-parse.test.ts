// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StarterKit } from "@react-email/editor/extensions";
import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	absolutizeEmailAssetUrls,
	inlineEmailStylesheet,
} from "./inline-email-stylesheet";

const CONTAINER_HTML = `
<div data-type="container" class="node-container" style="max-width:640px;padding-top:40px;padding-right:32px;padding-bottom:40px;padding-left:32px;background-color:#131313">
  <p style="margin-top:0;margin-bottom:16px;font-size:56px;color:#ffffff">WELCOME TO DITHER</p>
</div>
`;

function containerStyle(doc: {
	content?: Array<{ type?: string; attrs?: { style?: string } }>;
}) {
	const node = doc.content?.find((item) => item.type === "container");
	return node?.attrs?.style ?? "";
}

describe("container style parse", () => {
	it("drops container padding when StyleAttribute omits container", () => {
		const doc = generateJSON(CONTAINER_HTML, [
			StarterKit.configure({ UndoRedo: false }),
		] as never);

		expect(containerStyle(doc)).not.toMatch(/padding-top:\s*40px/i);
	});

	it("keeps container padding, max-width, and heading size", () => {
		const doc = generateJSON(CONTAINER_HTML, [emailStarterKit()] as never);
		const style = containerStyle(doc);

		expect(style).toMatch(/padding-top:\s*40px/i);
		expect(style).toMatch(/max-width:\s*640px/i);
		expect(JSON.stringify(doc)).toMatch(/font-size:\s*56px/i);
	});
});

describe("email canvas container centering", () => {
	it("centers the 640px email column with margin auto so a refresh cannot drop it", () => {
		const css = readFileSync(
			join(
				dirname(fileURLToPath(import.meta.url)),
				"../components/canvas/email-canvas.css",
			),
			"utf8",
		);

		expect(css).toMatch(/\.node-container/);
		expect(css).toMatch(/margin-left:\s*auto/);
		expect(css).toMatch(/margin-right:\s*auto/);
		expect(css).not.toMatch(
			/table\[alignment="center"\][^}]*text-align:\s*start\s*!important/,
		);
	});

	it("does not add canvas chrome padding above the email body", () => {
		const css = readFileSync(
			join(
				dirname(fileURLToPath(import.meta.url)),
				"../components/canvas/email-canvas.css",
			),
			"utf8",
		);
		const builder = readFileSync(
			join(
				dirname(fileURLToPath(import.meta.url)),
				"../components/canvas/email-builder.tsx",
			),
			"utf8",
		);

		expect(builder).not.toMatch(/py-6/);
		expect(css).toMatch(
			/\.ProseMirror[^{]*\{[^}]*padding-top:\s*0\s*!important/,
		);
	});
});

describe("parseGlobalStylesFromHtml canvas defaults", () => {
	it("does not force wrapper font-size onto every block with !important", () => {
		const source = readFileSync(
			join(
				dirname(fileURLToPath(import.meta.url)),
				"../components/panels/code/code-view.tsx",
			),
			"utf8",
		);

		expect(source).toMatch(/font-size:\$\{baseFontSize\};/);
		expect(source).not.toMatch(/font-size:\$\{baseFontSize\}!important/);
		expect(source).not.toMatch(
			/child\.style\.textAlign\.toLowerCase\(\) === "center"/,
		);
	});
});

/**
 * Decorative glows live on the ~600px wrapper as background-image.
 * Paste must keep the image layer and resolve root-relative asset
 * paths against the document's absolute origin — not the editor host.
 */
const GLOW_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    .glow {
      background-image: url('/static/corner-glow.png');
      background-position: bottom;
      background-repeat: no-repeat;
    }
  </style>
</head>
<body>
  <img src="https://cdn.example.com/static/logo.png" alt="logo" />
  <table class="glow" width="600" style="max-width:600px;width:100%">
    <tr>
      <td style="padding-top:20px;padding-right:25px;padding-bottom:48px;padding-left:25px">
        <p>Your magic link</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

describe("container background-image paste", () => {
	it("inlines stylesheet background-image onto the matching table", () => {
		const doc = new DOMParser().parseFromString(GLOW_HTML, "text/html");
		inlineEmailStylesheet(doc);
		const table = doc.querySelector("table");
		const style = table?.getAttribute("style") ?? "";

		expect(style).toMatch(/background-image:\s*url\(/i);
		expect(style).toMatch(/background-position:\s*(?:center\s+)?bottom/i);
		expect(style).toMatch(/background-repeat:\s*no-repeat/i);
	});

	it("keeps background-image on the container through TipTap parse", () => {
		const html = `<div data-type="container" class="node-container" style="max-width:600px;background-image:url('https://cdn.example.com/static/corner-glow.png');background-position:bottom;background-repeat:no-repeat">
  <p>Your magic link</p>
</div>`;
		const json = generateJSON(html, [emailStarterKit()] as never);
		expect(containerStyle(json)).toMatch(/background-image:\s*url\(/i);
		expect(containerStyle(json)).toMatch(/corner-glow\.png/);
		expect(containerStyle(json)).toMatch(/background-position:\s*bottom/i);
		expect(containerStyle(json)).toMatch(/background-repeat:\s*no-repeat/i);
	});

	it("rewrites root-relative background urls to the paste's asset origin", () => {
		const doc = new DOMParser().parseFromString(GLOW_HTML, "text/html");
		inlineEmailStylesheet(doc);
		absolutizeEmailAssetUrls(doc);

		const table = doc.querySelector("table");
		const style = table?.getAttribute("style") ?? "";
		const css = doc.querySelector("style")?.textContent ?? "";

		expect(style).toMatch(
			/https:\/\/cdn\.example\.com\/static\/corner-glow\.png/,
		);
		expect(style).not.toMatch(/url\(\s*['"]?\/static\/corner-glow/);
		expect(css).toMatch(
			/https:\/\/cdn\.example\.com\/static\/corner-glow\.png/,
		);
		expect(css).not.toMatch(/url\(\s*['"]?\/static\/corner-glow/);
	});

	it("inlines escaped stylesheet selectors for arbitrary background images", () => {
		const html = `<!DOCTYPE html>
<html>
<head>
  <style>
    .bg-\\[url\\(\\'\\/static\\/corner-glow\\.png\\'\\)\\] {
      background-image: url('/static/corner-glow.png');
    }
    .\\[background-position\\:bottom\\] {
      background-position: bottom;
    }
    .\\[background-repeat\\:no-repeat\\] {
      background-repeat: no-repeat;
    }
  </style>
</head>
<body>
  <img src="https://cdn.example.com/static/logo.png" alt="logo" />
  <table width="600" style="max-width:600px;width:100%">
    <tr><td><p>Your magic link</p></td></tr>
  </table>
</body>
</html>`;
		const doc = new DOMParser().parseFromString(html, "text/html");
		const table = doc.querySelector("table");
		const open = String.fromCharCode(91);
		const close = String.fromCharCode(93);
		table?.setAttribute(
			"class",
			[
				`bg-${open}url('/static/corner-glow.png')${close}`,
				`${open}background-position:bottom${close}`,
				`${open}background-repeat:no-repeat${close}`,
			].join(" "),
		);
		inlineEmailStylesheet(doc);
		const style = table?.getAttribute("style") ?? "";
		expect(style).toMatch(/background-image:\s*url\(/i);
	});
});
