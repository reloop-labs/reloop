// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
	prepareCampaignHtmlForEditor,
	resolveCampaignEditorDocument,
} from "./hydrate-campaign-editor-content";

describe("resolveCampaignEditorDocument", () => {
	it("prefers editor JSON over composed email HTML", () => {
		const content = [
			{
				type: "paragraph",
				attrs: { textAlign: "left" },
				content: [{ type: "text", text: "Hello" }],
			},
		];

		expect(
			resolveCampaignEditorDocument({
				content,
				contentHtml:
					'<table align="center" style="text-align:center"><tr><td>Hello</td></tr></table>',
			}),
		).toEqual({ kind: "json", content });
	});

	it("falls back to HTML when JSON is missing", () => {
		expect(
			resolveCampaignEditorDocument({
				content: [],
				contentHtml: "<p>Hello</p>",
			}),
		).toEqual({ kind: "html", html: "<p>Hello</p>" });
	});

	it("returns null when both sources are empty", () => {
		expect(
			resolveCampaignEditorDocument({ content: [], contentHtml: "" }),
		).toBeNull();
	});
});

describe("prepareCampaignHtmlForEditor", () => {
	it("unwraps the centered email container table and keeps inner copy", () => {
		const html = `
			<table align="center" width="100%" style="text-align:center">
				<tr>
					<td>
						<table align="center" width="600" style="max-width:600px;text-align:center">
							<tr>
								<td>
									<p style="text-align:left">Welcome back</p>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
		`;

		const prepared = prepareCampaignHtmlForEditor(html);

		expect(prepared).toContain("Welcome back");
		expect(prepared).toContain('data-type="container"');
		expect(prepared.toLowerCase()).not.toContain('align="center"');
		expect(prepared.toLowerCase()).not.toContain("text-align: center");
		expect(prepared.toLowerCase()).not.toContain("text-align:center");
	});

	it("unwraps <center> wrappers", () => {
		const prepared = prepareCampaignHtmlForEditor(
			"<center><p>Keep me</p></center>",
		);
		expect(prepared).toContain("Keep me");
		expect(prepared.toLowerCase()).not.toContain("<center");
	});
});
