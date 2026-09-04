// @vitest-environment jsdom

import { Node } from "@tiptap/core";
import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import { inlineEmailStylesheet } from "./inline-email-stylesheet";
import { preserveEmailLinkUnderlines } from "./preserve-email-link-underlines";
import {
	alignImageOnlyCells,
	alignImageOnlyCellsInJson,
	alignImageOnlyTableRows,
	collapseEmptyLayoutCells,
	promoteCellTypographyToBlocks,
	promoteInheritedTypography,
	promoteTableSpacingToCells,
	stampThemeNeutralBlockPadding,
	unwrapLinkedImages,
} from "./promote-table-spacing";
import { rewriteLowContrastInlineText } from "./readable-text-color";
import {
	findEmailContainerTable,
	liftNestedHeadingParagraphs,
	prepareEmailHtmlForParse,
	stripEmailCentering,
	takeEmailColumnContents,
} from "./strip-email-centering";

/** Matches the live editor's Image node: block atom parsed from `img[src]`. */
const EmailImage = Node.create({
	name: "image",
	group: "block",
	atom: true,
	addAttributes() {
		return {
			src: { default: "" },
			alt: { default: "" },
			width: { default: null },
			height: { default: null },
			href: { default: null },
			style: { default: null },
		};
	},
	parseHTML() {
		return [{ tag: "img[src]" }];
	},
	renderHTML({ HTMLAttributes }) {
		return ["img", HTMLAttributes];
	},
});

/**
 * Same order as sanitizeEmailHtml: class styles → centering → links →
 * contrast → table spacing → typography flatten → TipTap JSON.
 */
function pasteToJson(html: string) {
	const doc = new DOMParser().parseFromString(
		prepareEmailHtmlForParse(html),
		"text/html",
	);
	inlineEmailStylesheet(doc);
	unwrapLinkedImages(doc.body);
	stripEmailCentering(doc.body);
	preserveEmailLinkUnderlines(doc.body);
	rewriteLowContrastInlineText(doc.body, "rgb(19, 19, 19)");
	promoteTableSpacingToCells(doc.body);
	promoteCellTypographyToBlocks(doc.body);
	promoteInheritedTypography(doc.body);
	stampThemeNeutralBlockPadding(doc.body);
	alignImageOnlyTableRows(doc.body);
	alignImageOnlyCells(doc.body);
	collapseEmptyLayoutCells(doc.body);
	return {
		doc,
		json: generateJSON(doc.body.innerHTML, [
			emailStarterKit(),
			EmailImage,
		] as never),
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

describe("paste fidelity for image-only column rows", () => {
	it("keeps avatar | arrow | logo middle-aligned without a social-icon center", () => {
		const html = `<table align="center" width="100%">
			<tr>
				<td data-id="__react-email-column" align="right">
					<img alt="Alan" width="64" height="64" style="display:block" src="https://example.com/user.png" />
				</td>
				<td data-id="__react-email-column" align="center">
					<img alt="" width="12" height="9" style="display:block" src="https://example.com/arrow.png" />
				</td>
				<td data-id="__react-email-column" align="left">
					<img alt="Enigma" width="64" height="64" style="display:block" src="https://example.com/team.png" />
				</td>
			</tr>
		</table>`;
		const { doc, json } = pasteToJson(html);
		const table = doc.querySelector("table");
		expect(table?.getAttribute("data-icon-row")).toBeNull();
		expect(table?.getAttribute("data-image-row")).toBe("true");
		const cells = Array.from(doc.querySelectorAll("td"));
		expect(cells.map((td) => td.style.verticalAlign)).toEqual([
			"middle",
			"middle",
			"middle",
		]);
		expect(cells.map((td) => td.style.textAlign)).toEqual([
			"right",
			"center",
			"left",
		]);
		for (const img of Array.from(doc.querySelectorAll("img"))) {
			expect((img as HTMLImageElement).style.display).toBe("inline-block");
			expect((img as HTMLImageElement).style.verticalAlign).toBe("middle");
		}
		const dumped = JSON.stringify(json);
		expect(dumped).toMatch(/vertical-align:\s*middle/i);
		expect(dumped).toMatch(/text-align:\s*right/i);
		expect(dumped).toMatch(/"data-image-row"\s*:\s*"true"/);
		expect(dumped).not.toMatch(/"data-icon-row"\s*:\s*"true"/);
	});
});

describe("paste fidelity for shrink-wrapped centered rows", () => {
	it("keeps a 166px two-link footer centered instead of stretching to the column", () => {
		const html = `<div data-type="container" style="max-width:600px">
			<table align="center" width="100%" style="width:370px;margin-right:auto;margin-left:auto">
				<tr>
					<td data-id="__react-email-column" align="center"><a href="https://www.nike.com/">Men</a></td>
					<td data-id="__react-email-column" align="center"><a href="https://www.nike.com/">Women</a></td>
					<td data-id="__react-email-column" align="center"><a href="https://www.nike.com/">Kids</a></td>
					<td data-id="__react-email-column" align="center"><a href="https://www.nike.com/">Customize</a></td>
				</tr>
			</table>
			<table align="center" width="100%" style="width:166px;margin-right:auto;margin-left:auto">
				<tr>
					<td data-id="__react-email-column">
						<p style="color:rgb(175,175,175);text-align:center">Web Version</p>
					</td>
					<td data-id="__react-email-column">
						<p style="color:rgb(175,175,175);text-align:center">Privacy Policy</p>
					</td>
				</tr>
			</table>
		</div>`;
		const { doc, json } = pasteToJson(html);
		const footer = Array.from(doc.querySelectorAll("table")).find((table) =>
			table.textContent?.includes("Web Version"),
		);
		const nav = Array.from(doc.querySelectorAll("table")).find((table) =>
			table.textContent?.includes("Customize"),
		);
		expect(footer?.style.width).toBe("166px");
		expect(footer?.style.marginLeft).toBe("auto");
		expect(footer?.style.marginRight).toBe("auto");
		expect(nav?.style.width).toBe("370px");
		expect(nav?.style.marginLeft).toBe("auto");
		expect(nav?.style.marginRight).toBe("auto");

		function findTableWithText(
			node: unknown,
			text: string,
		): { attrs?: Record<string, unknown> } | undefined {
			if (!node || typeof node !== "object") return undefined;
			const n = node as {
				type?: string;
				content?: unknown[];
				attrs?: Record<string, unknown>;
			};
			if (n.type === "table" && JSON.stringify(n).includes(text)) return n;
			for (const child of n.content ?? []) {
				const found = findTableWithText(child, text);
				if (found) return found;
			}
			return undefined;
		}
		const footerNode = findTableWithText(json, "Web Version");
		expect(footer?.getAttribute("data-shrink-row")).toBe("true");
		expect(footerNode?.attrs?.style).toMatch(/width:\s*166px/i);
		expect(footerNode?.attrs?.style).toMatch(/margin-left:\s*auto/i);
		expect(footerNode?.attrs?.width).not.toBe("100%");
		expect(footer?.getAttribute("width")).not.toBe("100%");
		expect(footerNode?.attrs?.["data-shrink-row"]).toBe("true");
		const web = Array.from(doc.querySelectorAll("p")).find((p) =>
			p.textContent?.includes("Web Version"),
		);
		expect(web?.style.textAlign).toBe("center");
	});

	it("keeps footer copy centered when React Email puts a paragraph in a row without a cell", () => {
		const html = `<div data-type="container" style="max-width:600px">
			<table align="center" width="100%">
				<tr>
					<td style="padding-bottom:22px;padding-top:22px">
						<table align="center" width="100%" style="width:166px;margin-right:auto;margin-left:auto">
							<tbody style="width:100%">
								<tr style="width:100%">
									<td data-id="__react-email-column">
										<p style="color:rgb(175,175,175);text-align:center">Web Version</p>
									</td>
									<td data-id="__react-email-column">
										<p style="color:rgb(175,175,175);text-align:center">Privacy Policy</p>
									</td>
								</tr>
							</tbody>
						</table>
						<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
							<tbody style="width:100%">
								<tr style="width:100%">
									<p
										style="font-size:13px;line-height:24px;margin:0;color:rgb(175,175,175);text-align:center;padding-bottom:30px;padding-top:30px;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0">
										Please contact us if you have any questions.
										(If you reply to this email, we won&#x27;t
										be able to see it.)
									</p>
								</tr>
							</tbody>
						</table>
						<table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
							<tbody style="width:100%">
								<tr style="width:100%">
									<p
										style="font-size:13px;line-height:24px;margin:0;color:rgb(175,175,175);text-align:center;margin-top:0;margin-bottom:0;margin-left:0;margin-right:0">
										© 2022 Nike, Inc. All Rights Reserved.
									</p>
								</tr>
							</tbody>
						</table>
					</td>
				</tr>
			</table>
		</div>`;
		const { doc, json } = pasteToJson(html);
		const contact = Array.from(doc.querySelectorAll("p")).find((p) =>
			p.textContent?.includes("Please contact us"),
		);
		const copyright = Array.from(doc.querySelectorAll("p")).find((p) =>
			p.textContent?.includes("All Rights Reserved"),
		);
		expect(contact?.style.textAlign).toBe("center");
		expect(copyright?.style.textAlign).toBe("center");
		expect(contact?.closest("td")).not.toBeNull();
		function findParagraphWithText(
			node: unknown,
			text: string,
		): { attrs?: Record<string, unknown> } | undefined {
			if (!node || typeof node !== "object") return undefined;
			const n = node as {
				type?: string;
				content?: unknown[];
				attrs?: Record<string, unknown>;
			};
			if (n.type === "paragraph" && JSON.stringify(n).includes(text)) return n;
			for (const child of n.content ?? []) {
				const found = findParagraphWithText(child, text);
				if (found) return found;
			}
			return undefined;
		}
		const contactNode = findParagraphWithText(json, "Please contact us");
		expect(contactNode?.attrs?.style).toMatch(/text-align:\s*center/i);
		expect(contactNode?.attrs?.alignment).toBe("center");
	});

	it("collapses empty divider cells so a 1px rule does not become a paragraph gap", () => {
		const html = `<div data-type="container" style="max-width:580px">
			<table style="padding:30px">
				<tr><td><img alt="Twitch" width="114" height="40" /></td></tr>
			</table>
			<table width="100%" role="presentation">
				<tr>
					<td data-id="__react-email-column" style="border-bottom:1px solid rgb(238,238,238);width:249px"></td>
					<td data-id="__react-email-column" style="border-bottom:1px solid rgb(145,71,255);width:102px"></td>
					<td data-id="__react-email-column" style="border-bottom:1px solid rgb(238,238,238);width:249px"></td>
				</tr>
			</table>
			<p>Hi alanturing,</p>
		</div>`;
		const { doc, json } = pasteToJson(html);
		const fillersDom = doc.querySelectorAll("p[data-empty-cell]");
		expect(fillersDom).toHaveLength(3);
		for (const p of Array.from(fillersDom)) {
			expect((p as HTMLElement).style.paddingTop).toMatch(/^0/);
			expect((p as HTMLElement).style.lineHeight).toMatch(/^0/);
			expect((p as HTMLElement).style.fontSize).toMatch(/^0/);
		}
		function findEmptyCellMarkers(
			node: unknown,
			acc: { attrs?: Record<string, unknown> }[] = [],
		): { attrs?: Record<string, unknown> }[] {
			if (!node || typeof node !== "object") return acc;
			const n = node as {
				type?: string;
				content?: unknown[];
				attrs?: Record<string, unknown>;
			};
			if (n.type === "paragraph" && n.attrs?.["data-empty-cell"] === "true") {
				acc.push(n);
			}
			for (const child of n.content ?? []) {
				findEmptyCellMarkers(child, acc);
			}
			return acc;
		}
		expect(findEmptyCellMarkers(json)).toHaveLength(3);
	});

	it("centers a one-cell linked logo and keeps a right-aligned icon group", () => {
		const html = `<div data-type="container" style="max-width:640px">
			<table width="100%">
				<tr>
					<td align="center" data-id="__react-email-column">
						<a href="https://www.amazon.com">
							<img alt="Amazon Prime Logo" width="109" height="48" src="https://demo.react.email/static/amazon-prime-logo.png" />
						</a>
					</td>
				</tr>
			</table>
			<table width="100%">
				<tr>
					<td data-id="__react-email-column">
						<img alt="Amazon Logo" width="93" height="23" src="https://demo.react.email/static/amazon-logo.png" />
					</td>
					<td align="right" data-id="__react-email-column">
						<img alt="Amazon Social Midia" width="30" height="30" src="https://demo.react.email/static/amazon-instagram.jpg" class="inline-block" />
						<img alt="Amazon Social Midia" width="30" height="30" src="https://demo.react.email/static/amazon-facebook.jpg" class="inline-block" />
						<img alt="Amazon Social Midia" width="30" height="30" src="https://demo.react.email/static/amazon-twitter.jpg" class="inline-block" />
					</td>
				</tr>
			</table>
		</div>`;
		const { doc, json } = pasteToJson(html);
		const prime = doc.querySelector('img[alt="Amazon Prime Logo"]');
		expect(prime?.closest("a")).toBeNull();
		expect(prime?.getAttribute("href")).toBe("https://www.amazon.com");
		expect(prime?.closest("td")?.style.textAlign).toBe("center");

		const socials = Array.from(
			doc.querySelectorAll('img[alt="Amazon Social Midia"]'),
		);
		expect(socials).toHaveLength(3);
		expect(socials[0]?.closest("td")?.style.textAlign).toBe("right");
		for (const img of socials) {
			expect(img.style.display).toBe("inline-block");
		}

		const dumped = JSON.stringify(json);
		expect(dumped).toContain("Amazon Prime Logo");
		expect(dumped.match(/Amazon Social Midia/g)?.length).toBe(3);
	});

	it("keeps px-2 gaps between linked footer icons after the anchors unwrap", () => {
		const html = `<div data-type="container" style="max-width:640px">
			<style>
				.px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
				.inline-block { display: inline-block; }
			</style>
			<table width="100%">
				<tr>
					<td style="text-align:center">
						<a href="https://example.com/" class="inline-block px-2"><img alt="X" src="https://example.com/x.png" width="18" /></a>
						<a href="https://example.com/" class="inline-block px-2"><img alt="LinkedIn" src="https://example.com/in.png" width="18" /></a>
						<a href="https://example.com/" class="inline-block px-2"><img alt="YouTube" src="https://example.com/yt.png" width="18" /></a>
						<a href="https://example.com/" class="inline-block px-2"><img alt="GitHub" src="https://example.com/gh.png" width="18" /></a>
					</td>
				</tr>
			</table>
		</div>`;
		const { doc, json } = pasteToJson(html);
		const icons = Array.from(doc.querySelectorAll("img"));
		expect(icons).toHaveLength(4);
		for (const img of icons) {
			expect(img.closest("a")).toBeNull();
			expect(img.style.marginLeft).toBe("0.5rem");
			expect(img.style.marginRight).toBe("0.5rem");
		}
		expect(JSON.stringify(json)).toMatch(/margin-left:\s*0\.5rem/i);
	});

	it("keeps concatenated 30px footer icons as cell children after JSON normalize", () => {
		const html = `<div data-type="container" style="max-width:640px">
			<table width="100%">
				<tr>
					<td data-id="__react-email-column">
						<img alt="Amazon Logo" height="23" src="https://example.com/amazon-logo.png" width="93" />
					</td>
					<td align="right" data-id="__react-email-column">
						<img alt="Amazon Social Midia" height="30" src="https://example.com/ig.jpg" style="display:inline-block;margin-left:10px" width="30" /><img alt="Amazon Social Midia" height="30" src="https://example.com/fb.jpg" style="display:inline-block;margin-left:10px" width="30" /><img alt="Amazon Social Midia" height="30" src="https://example.com/tw.jpg" style="display:inline-block;margin-left:10px" width="30" />
					</td>
				</tr>
			</table>
		</div>`;
		const { json } = pasteToJson(html);
		alignImageOnlyCellsInJson(json);
		const dumped = JSON.stringify(json);
		expect(dumped.match(/Amazon Social Midia/g)?.length).toBe(3);
		function paragraphHoldsSocial(node: unknown): boolean {
			if (!node || typeof node !== "object") return false;
			const n = node as { type?: string; content?: unknown[] };
			if (
				n.type === "paragraph" &&
				JSON.stringify(n).includes("Amazon Social Midia")
			) {
				return true;
			}
			return (n.content ?? []).some(paragraphHoldsSocial);
		}
		expect(paragraphHoldsSocial(json)).toBe(false);
	});
});
