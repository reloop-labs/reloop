// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

if (typeof DOMParser === "undefined") {
	const { JSDOM } = await import("jsdom");
	const dom = new JSDOM();
	globalThis.document = dom.window.document;
	globalThis.window = dom.window as unknown as Window & typeof globalThis;
	globalThis.DOMParser = dom.window.DOMParser;
	globalThis.Node = dom.window.Node;
	globalThis.Element = dom.window.Element;
	globalThis.HTMLElement = dom.window.HTMLElement;
	globalThis.HTMLDivElement = dom.window.HTMLDivElement;
	globalThis.HTMLTableElement = dom.window.HTMLTableElement;
	globalThis.HTMLAnchorElement = dom.window.HTMLAnchorElement;
	globalThis.NodeFilter = dom.window.NodeFilter;
}

import { sanitizeEmailHtml } from "./sanitize-email-html";

const SAMPLE = `<!DOCTYPE html>
<html>
<body style="background-color:#f4f4f4">
  <table role="presentation" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" width="600" style="max-width:600px;background-color:#ffffff">
          <tr>
            <td style="padding:24px">
              <h1 style="font-size:24px;color:#111111">Hello</h1>
              <p style="color:#333333">Welcome to Reloop.</p>
              <a href="https://reloop.sh" style="background:#111;color:#fff;padding:12px 20px">Open</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

describe("sanitizeEmailHtml", () => {
	it("unwraps the email column into a container without scripts", () => {
		const html = sanitizeEmailHtml(SAMPLE);
		expect(html).toMatch(/data-type="container"|node-container/);
		expect(html).toContain("Hello");
		expect(html).toContain("Welcome to Reloop");
		expect(html.toLowerCase()).not.toContain("<script");
	});

	it("preserves footer in multi-row table emails", () => {
		const SHOPIFY_SAMPLE = `<!DOCTYPE html>
<html>
<body style="background-color:#FDF3E9">
  <table class="body" width="100%">
    <tbody>
      <tr>
        <td class="content">
          <center>
            <table class="container" style="width:560px;background:#FDF3E9">
              <tr>
                <td class="main_section_cell">
                  <h1>Welcome to Snack TBH!</h1>
                  <p>You've activated your customer account.</p>
                </td>
              </tr>
            </table>
          </center>
        </td>
      </tr>
      <tr>
        <td class="footer" style="background:#000000">
          <center>
            <table class="container" style="width:560px">
              <tr>
                <td class="footer__cell" style="background:#000000;color:#ffffff">
                  <p>SNACKTBH.COM</p>
                  <p>© 2021 TBH | ALL RIGHTS RESERVED</p>
                </td>
              </tr>
            </table>
          </center>
        </td>
      </tr>
    </tbody>
  </table>
</body>
</html>`;
		const html = sanitizeEmailHtml(SHOPIFY_SAMPLE);
		expect(html).toContain("Welcome to Snack TBH!");
		expect(html).toContain("SNACKTBH.COM");
		expect(html).toContain("ALL RIGHTS RESERVED");
	});
});
