// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";
import {
	flattenedIconRowMarginTop,
	promoteCellTypographyToBlocks,
	promoteTableSpacingToCells,
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

	it("does not overwrite a paragraph that already has font-size", () => {
		const doc = new DOMParser().parseFromString(
			`<td style="font-size:15px"><p style="font-size:56px">Hero</p></td>`,
			"text/html",
		);
		promoteCellTypographyToBlocks(doc.body);
		expect(doc.querySelector("p")?.style.fontSize).toBe("56px");
	});
});
