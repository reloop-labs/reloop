// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	inlineEmailStylesheet,
	scopeEmailCssForEditor,
} from "./inline-email-stylesheet";

/**
 * Dither-style paste: heading spacing lives on a Tailwind class in <style>,
 * not on the td's inline style.
 */
const DITHER_HEADING_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; }
    .mobile_pt-10 { padding-top: 3.5rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .pb-12 { padding-bottom: 3rem; }
  </style>
</head>
<body>
  <table width="640" style="max-width:640px;background-color:#131313">
    <tr>
      <td>
        <table width="100%">
          <tr>
            <td class="mobile_pt-10 px-6 pb-12">
              <h1 style="color:#ffffff;font-size:56px">WELCOME TO DITHER</h1>
            </td>
          </tr>
        </table>
        <table width="100%">
          <tr>
            <td class="px-6">
              <p style="color:#c4c4c4">You can start exploring right away.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

function parseAndInline(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	inlineEmailStylesheet(doc);
	return doc.body.innerHTML;
}

describe("class-based email spacing", () => {
	it("inlines stylesheet padding onto cells", () => {
		const html = parseAndInline(DITHER_HEADING_HTML);
		expect(html).toMatch(/padding(?:-top)?:\s*3\.5rem/i);
		expect(html).toMatch(/1\.5rem/);
		expect(html).toMatch(/padding(?::[^"]*3rem|-bottom:\s*3rem)/i);
	});

	it("does not overwrite existing inline styles", () => {
		const html = parseAndInline(`<!DOCTYPE html>
<html>
<head>
  <style>.pad { padding-top: 99px; color: red; }</style>
</head>
<body>
  <p class="pad" style="color:#ffffff">Keep white</p>
</body>
</html>`);
		expect(html).toMatch(/padding-top:\s*99px/i);
		expect(html).toMatch(/color:\s*(#ffffff|rgb\(255,\s*255,\s*255\))/i);
	});

	it("keeps heading cell padding in the TipTap document", () => {
		const html = parseAndInline(DITHER_HEADING_HTML);
		const doc = generateJSON(html, [emailStarterKit()] as never);
		const json = JSON.stringify(doc);

		expect(json).toMatch(/padding(?:-top)?:\s*3\.5rem/i);
		expect(json).toMatch(/1\.5rem/);
		expect(json).toContain("WELCOME TO DITHER");
	});

	it("inlines Tailwind @layer utility color and size", () => {
		const html = parseAndInline(`<!DOCTYPE html>
<html>
<head>
  <style>
    @layer utilities {
      .text-hero { color: rgb(255, 255, 255); font-size: 56px; font-weight: 500; }
      .text-muted { color: rgb(196, 196, 196); }
    }
  </style>
</head>
<body>
  <h1 class="text-hero">Welcome</h1>
  <p class="text-muted">Invite your team</p>
</body>
</html>`);
		expect(html).toMatch(/color:\s*rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i);
		expect(html).toMatch(/font-size:\s*56px/i);
		expect(html).toMatch(/font-weight:\s*500/i);
		expect(html).toMatch(/color:\s*rgb\(\s*196\s*,\s*196\s*,\s*196\s*\)/i);
	});

	it("does not inline prefers-color-scheme dark text onto a light column", () => {
		const html = parseAndInline(`<!DOCTYPE html>
<html>
<head>
  <style>
    p { color: rgb(51, 51, 51); }
    @media (prefers-color-scheme: dark) {
      p { color: rgb(255, 255, 255); }
      body { background-color: rgb(34, 34, 34); }
    }
  </style>
</head>
<body>
  <p>Your challenge</p>
</body>
</html>`);
		expect(html).toMatch(/color:\s*rgb\(\s*51\s*,\s*51\s*,\s*51\s*\)/i);
		expect(html).not.toMatch(/color:\s*rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/i);
	});

	it("drops dark color-scheme media from editor-scoped CSS", () => {
		const scoped = scopeEmailCssForEditor(`
			p { color: #333; }
			@media (prefers-color-scheme: dark) {
				p { color: #fff; }
				body { background: #222; }
			}
		`);
		expect(scoped).toMatch(/color:\s*#333/);
		expect(scoped).not.toMatch(/prefers-color-scheme/);
		expect(scoped).not.toMatch(/#fff/);
	});

	it("scopes a * reset so utility classes still win", () => {
		const scoped = scopeEmailCssForEditor(
			"* { margin:0;padding:0; } .mobile_pt-10 { padding-top: 3.5rem; }",
		);
		expect(scoped).toMatch(/:where\(\*\)/);
		expect(scoped).not.toMatch(/\.ProseMirror \*(?=\s*\{)/);
		expect(scoped).toMatch(/mobile_pt-10/);
	});
});
