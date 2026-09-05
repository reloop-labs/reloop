// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	alignImageOnlyCellsInJson,
	alignImageOnlyRowsInJson,
	alignImageOnlyTableRows,
	collapseEmptyLayoutCells,
	flattenedIconRowMarginTop,
	promoteCellTypographyToBlocks,
	promoteInheritedTypography,
	promoteTableSpacingToCells,
	stampThemeNeutralBlockPadding,
	unwrapLinkedImages,
} from "./promote-table-spacing";

/** Logo + heading block from the pasted Dither source (inline table padding). */
const DITHER_HERO = `
<table style="padding-top:1.5rem;padding-right:1.5rem;padding-bottom:1.5rem;padding-left:1.5rem">
  <tr><td style="margin:0;padding:0"><img alt="" width="32" height="32" /></td></tr>
</table>
<table style="padding-top:4rem;padding-right:1.5rem;padding-bottom:3rem;padding-left:1.5rem">
  <tr>
    <td style="margin:0;padding:0">
      <p style="margin:0;padding:0;font-size:56px;line-height:1;letter-spacing:-1.68px;font-weight:500;color:rgb(255,255,255);text-transform:uppercase">Welcome to Dither</p>
      <p style="margin:0;padding:0;font-size:14px;line-height:1.5;color:rgb(196,196,196);margin-top:2.5rem">You can start exploring right away.</p>
    </td>
  </tr>
</table>
`;

describe("promoteTableSpacingToCells", () => {
	it("moves Dither section padding from the table onto the cell", () => {
		const doc = new DOMParser().parseFromString(DITHER_HERO, "text/html");
		promoteTableSpacingToCells(doc.body);

		const headingCell = doc.querySelectorAll("td")[1];
		expect(headingCell?.style.paddingTop).toBe("4rem");
		expect(headingCell?.style.paddingLeft).toBe("1.5rem");
		expect(headingCell?.style.paddingBottom).toBe("3rem");

		const headingTable = doc.querySelectorAll("table")[1];
		expect(headingTable?.style.paddingTop).toMatch(/^0/);
	});

	it("moves column table padding onto the cell before the wrapper is unwrapped", () => {
		const doc = new DOMParser().parseFromString(
			`<table style="max-width:640px;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px">
				<tr>
					<td style="margin:0;padding:0">
						<h1 style="background-color:rgb(244,211,94);padding-top:24px;padding-left:32px">This week: Cubes</h1>
						<p>The Shape challenge continues!</p>
					</td>
				</tr>
			</table>`,
			"text/html",
		);
		promoteTableSpacingToCells(doc.body);
		stampThemeNeutralBlockPadding(doc.body);
		const cell = doc.querySelector("td") as HTMLElement;
		const heading = doc.querySelector("h1") as HTMLElement;
		expect(cell.style.paddingTop).toBe("20px");
		expect(cell.style.paddingLeft).toBe("20px");
		expect(heading.style.paddingTop).toBe("24px");
		expect(heading.style.paddingLeft).toBe("32px");
	});

	it("keeps heading size, cell padding, and subtitle margin in TipTap JSON", () => {
		const doc = new DOMParser().parseFromString(DITHER_HERO, "text/html");
		promoteTableSpacingToCells(doc.body);
		const json = JSON.stringify(
			generateJSON(doc.body.innerHTML, [emailStarterKit()] as never),
		);

		expect(json).toMatch(/padding(?:-top)?:\s*4rem/i);
		expect(json).toMatch(/1\.5rem/);
		expect(json).toMatch(/font-size:\s*56px/i);
		expect(json).toMatch(/margin-top:\s*2\.5rem/i);
		expect(json).toContain("Welcome to Dither");
	});
});

describe("flattenedIconRowMarginTop", () => {
	it("does not stack 2rem on an inner icon row when the wrapper already has it", () => {
		const doc = new DOMParser().parseFromString(
			`<table style="margin-top:2rem;width:152px">
				<tr><td>
					<table><tr>
						<td><img width="20" height="20" alt="X" /></td>
						<td><img width="20" height="20" alt="Li" /></td>
					</tr></table>
				</td></tr>
			</table>`,
			"text/html",
		);
		const inner = doc.querySelectorAll("table")[1] as HTMLElement;
		expect(flattenedIconRowMarginTop(inner)).toBe("0");
	});

	it("keeps a 2rem fallback when the icon table is the gap owner", () => {
		const doc = new DOMParser().parseFromString(
			`<table><tr>
				<td><img width="20" height="20" alt="X" /></td>
				<td><img width="20" height="20" alt="Li" /></td>
			</tr></table>`,
			"text/html",
		);
		const table = doc.querySelector("table") as HTMLElement;
		expect(flattenedIconRowMarginTop(table)).toBe("2rem");
	});
});

describe("promoteCellTypographyToBlocks", () => {
	it("copies cell font-size and max-width onto a nested paragraph that lacks them", () => {
		const doc = new DOMParser().parseFromString(
			`<table><tr>
				<td style="font-size:13px;line-height:21px;max-width:320px;font-family:Georgia,serif">
					<p style="margin:0">barrier-first formulas, made for the long game.</p>
				</td>
			</tr></table>`,
			"text/html",
		);
		promoteCellTypographyToBlocks(doc.body);

		const p = doc.querySelector("p") as HTMLElement;
		expect(p.style.fontSize).toBe("13px");
		expect(p.style.maxWidth).toBe("320px");
		expect(p.style.fontFamily).toContain("Georgia");
		expect(p.style.lineHeight).toBe("21px");
	});

	it("copies cell color onto a nested link that lacks it", () => {
		const doc = new DOMParser().parseFromString(
			`<table><tr>
				<td style="color:rgb(196,196,196);font-size:15px">
					<a href="#">Read more</a>
				</td>
			</tr></table>`,
			"text/html",
		);
		promoteCellTypographyToBlocks(doc.body);
		expect(doc.querySelector("a")?.style.color).toBe("rgb(196, 196, 196)");
		expect(doc.querySelector("a")?.style.fontSize).toBe("15px");
	});

	it("does not overwrite a paragraph that already has font-size", () => {
		const doc = new DOMParser().parseFromString(
			`<td style="font-size:15px"><p style="font-size:56px">Hero</p></td>`,
			"text/html",
		);
		promoteCellTypographyToBlocks(doc.body);
		expect(doc.querySelector("p")?.style.fontSize).toBe("56px");
	});
});

describe("promoteInheritedTypography", () => {
	it("copies wrapper color and weight onto a heading that only has size", () => {
		const doc = new DOMParser().parseFromString(
			`<table><tr>
				<td style="color:rgb(255,255,255);font-weight:500;font-size:15px">
					<h1 style="font-size:56px">Welcome</h1>
					<p>Body copy</p>
				</td>
			</tr></table>`,
			"text/html",
		);
		promoteInheritedTypography(doc.body);
		const heading = doc.querySelector("h1") as HTMLElement;
		const body = doc.querySelector("p") as HTMLElement;
		expect(heading.style.color).toBe("rgb(255, 255, 255)");
		expect(heading.style.fontWeight).toBe("500");
		expect(heading.style.fontSize).toBe("56px");
		expect(body.style.color).toBe("rgb(255, 255, 255)");
		expect(body.style.fontSize).toBe("15px");
	});

	it("does not paint a filled button with the canvas text color", () => {
		const doc = new DOMParser().parseFromString(
			`<table><tr>
				<td style="color:rgb(255,255,255)">
					<a href="#" style="background-color:rgb(255,255,255);color:rgb(0,0,0)">Explore</a>
				</td>
			</tr></table>`,
			"text/html",
		);
		promoteInheritedTypography(doc.body);
		expect(doc.querySelector("a")?.style.color).toMatch(
			/^(rgb\(\s*0\s*,\s*0\s*,\s*0\s*\)|#000000|#000)$/i,
		);
	});
});

describe("stampThemeNeutralBlockPadding", () => {
	it("keeps source heading padding and only fills missing sides with 0", () => {
		const doc = new DOMParser().parseFromString(
			`<div>
				<h1 style="padding-top:24px;padding-right:32px;padding-bottom:24px;padding-left:32px">Cubes</h1>
				<p>The Shape challenge continues!</p>
			</div>`,
			"text/html",
		);
		stampThemeNeutralBlockPadding(doc.body);
		const heading = doc.querySelector("h1") as HTMLElement;
		const body = doc.querySelector("p") as HTMLElement;
		expect(heading.style.paddingTop).toBe("24px");
		expect(heading.style.paddingLeft).toBe("32px");
		expect(body.style.paddingTop).toMatch(/^0(px)?$/);
		expect(body.style.paddingLeft).toMatch(/^0(px)?$/);
	});
});

describe("alignImageOnlyTableRows", () => {
	const INVITE_ROW = `<table align="center" width="100%">
		<tbody>
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
		</tbody>
	</table>`;

	it("middle-aligns a 64px avatar row and does not treat it as a social-icon footer", () => {
		const doc = new DOMParser().parseFromString(INVITE_ROW, "text/html");
		alignImageOnlyTableRows(doc.body);
		const table = doc.querySelector("table") as HTMLTableElement;
		const cells = Array.from(table.querySelectorAll("td"));
		const images = Array.from(table.querySelectorAll("img"));

		expect(table.getAttribute("data-icon-row")).toBeNull();
		expect(table.getAttribute("data-image-row")).toBe("true");
		expect(cells.map((td) => td.getAttribute("align"))).toEqual([
			"right",
			"center",
			"left",
		]);
		expect(cells.map((td) => td.style.textAlign)).toEqual([
			"right",
			"center",
			"left",
		]);
		for (const td of cells) {
			expect(td.style.verticalAlign).toBe("middle");
		}
		for (const img of images) {
			expect(img.style.display).toBe("inline-block");
			expect(img.style.verticalAlign).toBe("middle");
		}

		const json = JSON.stringify(
			generateJSON(doc.body.innerHTML, [emailStarterKit()] as never),
		);
		expect(json).toMatch(/vertical-align:\s*middle/i);
		expect(json).toMatch(/text-align:\s*right/i);
		expect(json).toMatch(/"data-image-row"\s*:\s*"true"/);
		expect(json).not.toMatch(/"data-icon-row"\s*:\s*"true"/);
	});

	it("still tags a small social-icon row", () => {
		const doc = new DOMParser().parseFromString(
			`<table>
				<tr>
					<td align="right"><img width="20" height="20" src="https://example.com/twitter.png" /></td>
					<td align="left"><img width="20" height="20" src="https://example.com/facebook.png" /></td>
				</tr>
			</table>`,
			"text/html",
		);
		alignImageOnlyTableRows(doc.body);
		const table = doc.querySelector("table") as HTMLTableElement;
		expect(table.getAttribute("data-icon-row")).toBe("true");
		expect(table.getAttribute("data-image-row")).toBeNull();
	});

	it("does not retag a product column that mixes an image with text", () => {
		const doc = new DOMParser().parseFromString(
			`<table>
				<tr>
					<td data-id="__react-email-column" style="width:64px">
						<img alt="Halo Ring" width="48" height="48" />
					</td>
					<td data-id="__react-email-column">
						<p>Halo Ring 1</p>
					</td>
				</tr>
			</table>`,
			"text/html",
		);
		alignImageOnlyTableRows(doc.body);
		const table = doc.querySelector("table") as HTMLTableElement;
		expect(table.getAttribute("data-icon-row")).toBeNull();
		expect(table.getAttribute("data-image-row")).toBeNull();
		expect(table.querySelector("td")?.getAttribute("data-id")).toBe(
			"__react-email-column",
		);
	});

	it("zeros TipTap wrapper paragraphs so theme 0.5em padding cannot drop the avatar", () => {
		const json = {
			type: "doc",
			content: [
				{
					type: "table",
					content: [
						{
							type: "tableRow",
							content: [
								{
									type: "tableCell",
									attrs: { align: "right" },
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "image",
													attrs: {
														width: 64,
														style: "display:block",
													},
												},
											],
										},
									],
								},
								{
									type: "tableCell",
									attrs: { align: "center" },
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "image",
													attrs: {
														width: 12,
														style: "display:block",
													},
												},
											],
										},
									],
								},
								{
									type: "tableCell",
									attrs: { align: "left" },
									content: [
										{
											type: "paragraph",
											content: [
												{
													type: "image",
													attrs: {
														width: 64,
														style: "display:block",
													},
												},
											],
										},
									],
								},
							],
						},
					],
				},
			],
		};
		expect(alignImageOnlyRowsInJson(json)).toBe(true);
		const dumped = JSON.stringify(json);
		expect(dumped).toMatch(/"data-image-row"\s*:\s*"true"/);
		expect(dumped).not.toMatch(/"data-icon-row"\s*:\s*"true"/);
		expect(dumped).toMatch(/vertical-align:\s*middle/i);
		expect(dumped).toMatch(/text-align:\s*right/i);
		expect(dumped).toMatch(/padding-top:\s*0/i);
		expect(dumped).toMatch(/display:\s*inline-block/i);
		expect(alignImageOnlyRowsInJson(json)).toBe(false);
	});
});

describe("alignImageOnlyCellsInJson", () => {
	it("does not wrap a 3-icon cell in a paragraph", () => {
		const json = {
			type: "doc",
			content: [
				{
					type: "tableCell",
					attrs: { style: "text-align:right", alignment: "right" },
					content: [
						{ type: "image", attrs: { alt: "Amazon Social Midia", width: 30 } },
						{ type: "image", attrs: { alt: "Amazon Social Midia", width: 30 } },
						{ type: "image", attrs: { alt: "Amazon Social Midia", width: 30 } },
					],
				},
			],
		};
		expect(alignImageOnlyCellsInJson(json)).toBe(true);
		const dumped = JSON.stringify(json);
		expect(dumped.match(/Amazon Social Midia/g)?.length).toBe(3);
		expect(dumped).toMatch(/display:\s*inline-block/i);
	});
});

describe("collapseEmptyLayoutCells", () => {
	it("fills an empty divider cell with a zero-box paragraph", () => {
		const doc = new DOMParser().parseFromString(
			`<table>
				<tr>
					<td style="border-bottom:1px solid rgb(145,71,255);width:102px"></td>
				</tr>
			</table>`,
			"text/html",
		);
		collapseEmptyLayoutCells(doc.body);
		const p = doc.querySelector("td > p");
		expect(p).toBeInstanceOf(HTMLElement);
		if (!(p instanceof HTMLElement)) return;
		expect(p.style.lineHeight).toMatch(/^0/);
		expect(p.style.fontSize).toMatch(/^0/);
		expect(p.style.paddingTop).toMatch(/^0/);
		expect(p.getAttribute("data-empty-cell")).toBe("true");
	});

	it("does not strip a logo image to collapse its cell", () => {
		const doc = new DOMParser().parseFromString(
			`<table>
				<tr>
					<td style="padding:30px"><img alt="Twitch" width="114" /></td>
				</tr>
			</table>`,
			"text/html",
		);
		collapseEmptyLayoutCells(doc.body);
		expect(doc.querySelector("img")?.getAttribute("alt")).toBe("Twitch");
		expect(doc.querySelector("td")?.querySelectorAll("p")).toHaveLength(0);
	});
});

describe("unwrapLinkedImages", () => {
	it("moves a logo link href onto the image so TipTap can keep the block", () => {
		const doc = new DOMParser().parseFromString(
			`<td align="center"><a href="https://www.amazon.com"><img alt="Prime" src="https://example.com/p.png" width="109" /></a></td>`,
			"text/html",
		);
		unwrapLinkedImages(doc.body);
		const img = doc.querySelector("img");
		expect(img?.getAttribute("href")).toBe("https://www.amazon.com");
		expect(doc.querySelector("a")).toBeNull();
	});

	it("moves the link's horizontal padding onto the image so icon gaps survive unwrap", () => {
		const doc = new DOMParser().parseFromString(
			`<td><a href="https://example.com/" style="display:inline-block;padding-left:0.5rem;padding-right:0.5rem"><img alt="X" src="https://example.com/x.png" width="18" /></a></td>`,
			"text/html",
		);
		unwrapLinkedImages(doc.body);
		const img = doc.querySelector("img");
		expect(img?.getAttribute("href")).toBe("https://example.com/");
		expect(img?.style.marginLeft).toBe("0.5rem");
		expect(img?.style.marginRight).toBe("0.5rem");
	});
});
