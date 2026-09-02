// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { sanitizePreviewHtml } from "./sanitize-preview-html";

const DITHER_SLICE = `<!DOCTYPE html>
<html>
<head>
  <style>
    .mobile_pt-10 { padding-top: 3.5rem; }
    @media (max-width: 600px) { .mobile_pt-10 { padding-top: 2rem; } }
  </style>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Condensed" />
</head>
<body>
  <table align="center" width="600" role="presentation">
    <tr>
      <td>
        <img src="https://react-email-demo.vercel.app/static/dither/dither-image-1.png" width="592" alt="Dither" />
        <h1 style="color:rgb(255,255,255)">GET STARTED</h1>
      </td>
    </tr>
  </table>
</body>
</html>`;

describe("sanitizePreviewHtml", () => {
	it("drops scripts and javascript URLs, keeps style tables and images", () => {
		const dirty = `<!DOCTYPE html>
<html>
<head>
  <style>.mobile_pt-10{padding-top:3.5rem}</style>
</head>
<body>
  <script>alert(1)</script>
  <table align="center" width="600" role="presentation">
    <tr>
      <td>
        <img src="https://example.com/hero.png" width="592" alt="Hero" onclick="steal()" />
        <a href="javascript:alert(1)">Help Center</a>
        <p>Need help?</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

		const result = sanitizePreviewHtml(dirty);

		expect(result).not.toMatch(/<script/i);
		expect(result).not.toMatch(/javascript:/i);
		expect(result).not.toMatch(/onclick/i);
		expect(result).toMatch(/<style/i);
		expect(result).toMatch(/mobile_pt-10/);
		expect(result).toMatch(/<table/i);
		expect(result).toMatch(/align="center"/i);
		expect(result).toMatch(/https:\/\/example.com\/hero.png/);
		expect(result).toMatch(/Need help\?/);
	});

	it("keeps font links and media-query CSS from a React Email slice", () => {
		const result = sanitizePreviewHtml(DITHER_SLICE);

		expect(result).toMatch(/IBM\+Plex\+Sans\+Condensed/);
		expect(result).toMatch(/@media \(max-width: 600px\)/);
		expect(result).toMatch(/dither-image-1\.png/);
		expect(result).toMatch(/GET STARTED/);
	});

	it("returns empty string for blank input", () => {
		expect(sanitizePreviewHtml("")).toBe("");
		expect(sanitizePreviewHtml("   ")).toBe("");
	});
});
