// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import { inlineEmailStylesheet } from "./inline-email-stylesheet";
import { preserveEmailLinkUnderlines } from "./preserve-email-link-underlines";
import {
	promoteCellTypographyToBlocks,
	promoteInheritedTypography,
	promoteTableSpacingToCells,
	stampThemeNeutralBlockPadding,
} from "./promote-table-spacing";
import { rewriteLowContrastInlineText } from "./readable-text-color";
import {
	findEmailContainerTable,
	liftNestedHeadingParagraphs,
	stripEmailCentering,
	takeEmailColumnContents,
} from "./strip-email-centering";

/**
 * Same order as sanitizeEmailHtml: class styles → centering → links →
 * contrast → table spacing → typography flatten → TipTap JSON.
 */
function pasteToJson(html: string) {
	const doc = new DOMParser().parseFromString(html, "text/html");
	inlineEmailStylesheet(doc);
	stripEmailCentering(doc.body);
	preserveEmailLinkUnderlines(doc.body);
	rewriteLowContrastInlineText(doc.body, "rgb(19, 19, 19)");
	promoteTableSpacingToCells(doc.body);
	promoteCellTypographyToBlocks(doc.body);
	promoteInheritedTypography(doc.body);
	stampThemeNeutralBlockPadding(doc.body);
	return {
		doc,
		json: generateJSON(doc.body.innerHTML, [emailStarterKit()] as never),
	};
}

const DARK_EMAIL = `<!DOCTYPE html>
<html>
<head>
  <style>
    @layer utilities {
      .text-hero { color: rgb(255, 255, 255); font-size: 56px; font-weight: 500; }
      .text-muted { color: rgb(196, 196, 196); font-size: 14px; }
    }
  </style>
</head>
<body style="background-color:rgb(19,19,19)">
  <table align="center" width="100%" style="max-width:640px;background-color:rgb(19,19,19)">
    <tr>
      <td align="center" style="color:rgb(255,255,255);font-weight:500">
        <h1 class="text-hero">Meet a new way to work</h1>
        <p class="text-muted">Invite your team and start exploring.</p>
        <a href="https://example.com/" style="display:inline-block;padding:12px 20px;background-color:rgb(255,255,255);color:rgb(0,0,0)">Explore Smart Tasks</a>
      </td>
    </tr>
  </table>
  <table align="center" width="100%">
    <tr>
      <td>
        <a href="https://example.com/" style="display:inline-block;padding:12px 20px;background-color:rgb(0,0,0);color:rgb(255,255,255)">Try it now</a>
      </td>
    </tr>
  </table>
</body>
</html>`;

/** Mixed-surface newsletter: full-bleed header + 640px column + two-col cards. */
const MIXED_NEWSLETTER = `<!DOCTYPE html>
<html>
<body style="background-color:#f4f4f4">
  <table width="100%" style="background-color:rgb(0,0,0)">
    <tr><td><img src="https://cdn.example.com/logo.png" width="600" alt="Brand" /></td></tr>
  </table>
  <table align="center" width="100%" style="max-width:640px;background-color:#ffffff">
    <tr>
      <td>
        <h1 style="background-color:rgb(255,221,64);font-size:32px;margin:0">
          This week: #Challenge:
          <p style="font-size:48px;font-weight:700;margin:0;display:inline">Cubes</p>
        </h1>
        <table width="100%" style="background-color:rgb(26,26,80)">
          <tr>
            <td style="color:rgb(255,255,255)">
              <p style="color:rgb(255,255,255)">PRO</p>
              <a href="https://example.com/" style="display:inline-block;background-color:rgb(255,255,255);color:rgb(0,102,255);padding:8px 16px;border-radius:4px">Learn More</a>
            </td>
          </tr>
        </table>
        <table width="100%">
          <tr>
            <td data-id="__react-email-column" style="width:50%;background-color:rgb(255,243,176)">
              <p style="color:rgb(51,51,51)">IDEAS!</p>
            </td>
            <td data-id="__react-email-column" style="width:50%;background-color:rgb(186,230,253)">
              <p style="color:rgb(51,51,51)">RESOURCES!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

describe("paste fidelity for mixed-surface newsletters", () => {
	it("keeps a full-bleed header sibling of the 640px column", () => {
		const lifted = liftNestedHeadingParagraphs(MIXED_NEWSLETTER);
		const parsed = new DOMParser().parseFromString(lifted, "text/html");
		const container = findEmailContainerTable(parsed.body);
		const cell =
			container?.querySelector("td") ??
			(() => {
				throw new Error("missing container cell");
			})();
		const nodes = takeEmailColumnContents(container as Element, cell);
		const html = nodes
			.map((node) =>
				node instanceof Element ? node.outerHTML : node.textContent,
			)
			.join("");

		expect(html).toMatch(/logo\.png/);
		expect(html).toMatch(/background-color:\s*rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)/);
		expect(html).toContain("IDEAS!");
		expect(html).toContain("RESOURCES!");
	});

	it("keeps Cubes inside the heading so it stays on the yellow bar", () => {
		const lifted = liftNestedHeadingParagraphs(MIXED_NEWSLETTER);
		expect(lifted).toMatch(
			/<h1[^>]*>[\s\S]*<span[^>]*>Cubes<\/span>[\s\S]*<\/h1>/i,
		);
		expect(lifted).not.toMatch(/<h1[^>]*>[\s\S]*<p[\s\S]*Cubes/i);

		const { json } = pasteToJson(lifted);
		const dumped = JSON.stringify(json);
		expect(dumped).toContain("Cubes");
		expect(dumped).toMatch(/font-size:\s*48px/i);
		expect(dumped).toMatch(/255,\s*221,\s*64/);
	});

	it("keeps two-column card backgrounds and dark card text", () => {
		const { doc, json } = pasteToJson(MIXED_NEWSLETTER);
		const dumped = JSON.stringify(json);

		expect(dumped).toMatch(/255,\s*243,\s*176/);
		expect(dumped).toMatch(/186,\s*230,\s*253/);
		expect(dumped).toContain("IDEAS!");
		expect(dumped).toContain("RESOURCES!");

		const ideas = Array.from(doc.querySelectorAll("p")).find((p) =>
			p.textContent?.includes("IDEAS!"),
		);
		expect(ideas?.style.color.replace(/\s/g, "")).toMatch(/51,51,51/);
		expect(
			ideas?.closest("td")?.style.backgroundColor.replace(/\s/g, ""),
		).toMatch(/255,243,176/);
	});

	it("keeps a filled Learn More button from becoming a theme-blue link", () => {
		const { doc, json } = pasteToJson(MIXED_NEWSLETTER);
		const dumped = JSON.stringify(json);
		const learn = Array.from(doc.querySelectorAll("a")).find((a) =>
			a.textContent?.includes("Learn More"),
		);

		expect(learn?.style.backgroundColor.replace(/\s/g, "")).toMatch(
			/255,255,255/,
		);
		expect(learn?.style.color.replace(/\s/g, "")).toMatch(/0,102,255/);
		expect(dumped).toMatch(/Learn More/);
		expect(dumped).toMatch(/border-radius:\s*4px/i);
	});
});

describe("paste fidelity for any dark email", () => {
	it("keeps hero color/size/weight, muted grey, left heading, and button colors", () => {
		const { doc, json } = pasteToJson(DARK_EMAIL);
		const dumped = JSON.stringify(json);

		expect(dumped).toMatch(/font-size:\s*56px/i);
		expect(dumped).toMatch(/font-weight:\s*500/i);
		expect(dumped).toMatch(/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/);
		expect(dumped).toMatch(/rgb\(\s*196\s*,\s*196\s*,\s*196\s*\)/);
		expect(dumped).not.toMatch(/"alignment"\s*:\s*"center"/);

		const heading = Array.from(doc.querySelectorAll("h1")).find((el) =>
			el.textContent?.includes("Meet a new way"),
		);
		expect(heading?.style.textAlign).not.toBe("center");
		expect(heading?.style.color.replace(/\s/g, "")).toMatch(/255,255,255/);

		const explore = Array.from(doc.querySelectorAll("a")).find((el) =>
			el.textContent?.includes("Explore Smart Tasks"),
		);
		expect(explore?.style.color.replace(/\s/g, "")).toMatch(
			/^(rgb\(0,0,0\)|#000000|#000)$/i,
		);
		expect(explore?.closest("p")?.style.textAlign).not.toBe("center");

		const tryIt = Array.from(doc.querySelectorAll("a")).find((el) =>
			el.textContent?.includes("Try it now"),
		);
		expect(tryIt?.closest("p")?.style.textAlign).not.toBe("center");
		expect(tryIt?.style.color.replace(/\s/g, "")).toMatch(/255,255,255/);
	});
});

describe("paste fidelity for heading and column padding", () => {
	it("keeps yellow-box padding and column inset in TipTap JSON", () => {
		const html = `<div data-type="container">
			<table style="max-width:640px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px">
				<tr>
					<td style="padding:0">
						<h1 style="background-color:rgb(244,211,94);padding-top:24px;padding-right:32px;padding-bottom:24px;padding-left:32px;margin:0">This week: Cubes</h1>
						<p style="margin-top:16px">The Shape challenge continues!</p>
					</td>
				</tr>
			</table>
		</div>`;
		const { doc, json } = pasteToJson(html);
		const dumped = JSON.stringify(json);
		expect(dumped).toMatch(/padding-top:\s*24px/i);
		expect(dumped).toMatch(/padding-left:\s*32px/i);
		expect(dumped).toMatch(/padding(?:-top)?:\s*20px/i);
		expect(dumped).toMatch(/margin-top:\s*16px/i);
		expect(doc.querySelector("h1")?.style.paddingTop).toBe("24px");
		expect(doc.querySelector("p")?.style.marginTop).toBe("16px");
	});
});
