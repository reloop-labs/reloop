// @vitest-environment jsdom

import { generateJSON } from "@tiptap/html";
import { describe, expect, it } from "vitest";
import { emailStarterKit } from "./email-starter-kit";

const LAYOUT_HTML = `
<div data-type="container" class="node-container" style="max-width:640px;background-color:#131313">
  <table width="100%" style="border-collapse:collapse">
    <tr>
      <td style="padding-top:4rem;padding-right:1.5rem;padding-bottom:3rem;padding-left:1.5rem">
        <p style="margin:0;font-size:56px;letter-spacing:-1.68px;color:#ffffff">Welcome to Dither</p>
      </td>
    </tr>
  </table>
  <table width="100%">
    <tr>
      <td style="padding-top:0;padding-right:1.5rem;padding-bottom:0;padding-left:1.5rem">
        <p style="margin:0;color:#c4c4c4">You can start exploring right away.</p>
      </td>
    </tr>
  </table>
</div>
`;

describe("layout table parse", () => {
	it("keeps nested tables, cell padding, and heading styles in the TipTap document", () => {
		const doc = generateJSON(LAYOUT_HTML, [emailStarterKit()] as never);
		const json = JSON.stringify(doc);

		expect(json).toContain('"type":"table"');
		expect(json).toContain('"type":"tableCell"');
		expect(json).toMatch(/padding-top:\s*4rem/i);
		expect(json).toMatch(/font-size:\s*56px/i);
		expect(json).toMatch(/letter-spacing:\s*-1\.68px/i);
		expect(json).not.toMatch(/"alignment"\s*:\s*"center"/);
	});
});
