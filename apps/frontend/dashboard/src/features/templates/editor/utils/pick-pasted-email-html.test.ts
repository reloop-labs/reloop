import { describe, expect, it } from "vitest";
import { pickPastedEmailHtml } from "./pick-pasted-email-html";

const SOURCE = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
<head>
<meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
<title>See your stats from 2024</title>
</head>
<body>
  <table align="center" width="600" style="max-width:600px">
    <tr><td>Year in review</td></tr>
  </table>
</body>
</html>`;

describe("pickPastedEmailHtml", () => {
	it("uses the source string when the canvas clipboard has no rich HTML", () => {
		const picked = pickPastedEmailHtml("", SOURCE);
		expect(picked).toContain("<!DOCTYPE html");
		expect(picked).toContain("See your stats from 2024");
		expect(picked).toContain("max-width:600px");
	});

	it("uses the source string instead of a browser wrapper of the same copy", () => {
		const wrapper =
			"<html><body><!--StartFragment--><span>&lt;!DOCTYPE html</span><!--EndFragment--></body></html>";
		const picked = pickPastedEmailHtml(wrapper, SOURCE);
		expect(picked).toContain("<table");
		expect(picked).not.toContain("&lt;!DOCTYPE");
	});

	it("keeps rendered clipboard HTML when plain text is just the email copy", () => {
		const rich = `<html><body><!--StartFragment--><table width="600"><tr><td>Hi</td></tr></table><!--EndFragment--></body></html>`;
		const picked = pickPastedEmailHtml(rich, "Hi");
		expect(picked).toContain("<table");
		expect(picked).not.toContain("<!--StartFragment-->");
	});
});
