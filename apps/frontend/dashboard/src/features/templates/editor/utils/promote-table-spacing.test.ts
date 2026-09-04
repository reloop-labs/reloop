// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	flattenedIconRowMarginTop,
	promoteCellTypographyToBlocks,
	promoteInheritedTypography,
	promoteTableSpacingToCells,
	stampThemeNeutralBlockPadding,
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
