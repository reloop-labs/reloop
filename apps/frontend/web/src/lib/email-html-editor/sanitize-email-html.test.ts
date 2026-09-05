// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
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
});
