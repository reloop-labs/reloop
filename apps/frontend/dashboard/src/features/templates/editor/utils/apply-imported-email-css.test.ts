import { describe, expect, it } from "vitest";
import { hoistCssImports } from "./apply-imported-email-css";

describe("hoistCssImports", () => {
	it("moves font imports ahead of other rules", () => {
		const css = `.a{color:red;}\n@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');\n.b{margin:0;}`;
		expect(hoistCssImports(css)).toBe(
			`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');\n.a{color:red;}\n\n.b{margin:0;}`,
		);
	});

	it("dedupes repeated imports", () => {
		const css = "@import url(a.css);\n.a{}\n@import url(a.css);";
		expect(hoistCssImports(css)).toBe("@import url(a.css);\n.a{}");
	});

	it("leaves CSS without imports untouched", () => {
		expect(hoistCssImports(".a{color:red;}")).toBe(".a{color:red;}");
	});
});
