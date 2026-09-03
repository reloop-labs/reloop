import { describe, expect, it } from "vitest";
import { shouldShowSourceHtmlPreview } from "./should-show-source-html-preview";

describe("shouldShowSourceHtmlPreview", () => {
	it("keeps visual mode on TipTap after a locked HTML paste", () => {
		expect(
			shouldShowSourceHtmlPreview({
				isCodeSplit: false,
				codeHtml: "<html><body><table></table></body></html>",
			}),
		).toBe(false);
	});

	it("shows the source preview only in code-split when HTML exists", () => {
		expect(
			shouldShowSourceHtmlPreview({
				isCodeSplit: true,
				codeHtml: "<html><body>Hi</body></html>",
			}),
		).toBe(true);
		expect(
			shouldShowSourceHtmlPreview({
				isCodeSplit: true,
				codeHtml: "   ",
			}),
		).toBe(false);
	});
});
