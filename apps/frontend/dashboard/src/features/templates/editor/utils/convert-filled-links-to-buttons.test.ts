// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
	convertFilledLinksToButtonsInJson,
	extractButtonFromParagraphJson,
	type TipTapJsonNode,
} from "./convert-filled-links-to-buttons";
import { stampFilledLinksAsEmailButtons } from "./preserve-email-link-underlines";

describe("convertFilledLinksToButtonsInJson", () => {
	it("converts a standalone CTA link paragraph into a button node", () => {
		const doc: TipTapJsonNode = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					attrs: { alignment: "center" },
					content: [
						{
							type: "text",
							text: "Confirm email",
							marks: [
								{
									type: "link",
									attrs: {
										href: "https://example.com/confirm",
										style:
											"background-color: #000000; padding: 12px 20px; border-radius: 4px; color: #ffffff; display: inline-block;",
										class: "button",
									},
								},
							],
						},
					],
				},
			],
		};

		const changed = convertFilledLinksToButtonsInJson(doc);
		expect(changed).toBe(true);

		const buttonNode = doc.content?.[0];
		expect(buttonNode?.type).toBe("button");
		expect(buttonNode?.attrs?.href).toBe("https://example.com/confirm");
		expect(buttonNode?.attrs?.alignment).toBe("center");
		expect(buttonNode?.attrs?.class).toBe("button");
		expect(buttonNode?.content?.[0]?.text).toBe("Confirm email");
		// Ensure link mark was stripped from inline text
		expect(buttonNode?.content?.[0]?.marks).toBeUndefined();
	});

	it("leaves normal paragraphs with inline links untouched", () => {
		const doc: TipTapJsonNode = {
			type: "doc",
			content: [
				{
					type: "paragraph",
					content: [
						{
							type: "text",
							text: "Please click ",
						},
						{
							type: "text",
							text: "here",
							marks: [
								{
									type: "link",
									attrs: {
										href: "https://example.com/help",
										style: "color: #3b82f6; text-decoration: underline;",
									},
								},
							],
						},
						{
							type: "text",
							text: " for more info.",
						},
					],
				},
			],
		};

		const changed = convertFilledLinksToButtonsInJson(doc);
		expect(changed).toBe(false);
		expect(doc.content?.[0]?.type).toBe("paragraph");
	});

	it("extractButtonFromParagraphJson retains bold mark if present", () => {
		const paragraph: TipTapJsonNode = {
			type: "paragraph",
			attrs: { alignment: "center" },
			content: [
				{
					type: "text",
					text: "Verify Now",
					marks: [
						{
							type: "link",
							attrs: {
								href: "https://example.com/verify",
								style: "background-color: #ff0000; padding: 10px 20px;",
							},
						},
						{
							type: "bold",
						},
					],
				},
			],
		};

		const result = extractButtonFromParagraphJson(paragraph);
		expect(result).not.toBeNull();
		expect(result?.attrs.href).toBe("https://example.com/verify");
		expect(result?.content[0]?.marks).toEqual([{ type: "bold" }]);
	});
});

describe("stampFilledLinksAsEmailButtons", () => {
	it("stamps a filled, padded <a> as react-email-button", () => {
		const div = document.createElement("div");
		div.innerHTML = `
			<p>
				<a href="https://example.com" style="background-color: #000000; padding: 12px 20px; border-radius: 4px;">
					Click me
				</a>
			</p>
		`;

		stampFilledLinksAsEmailButtons(div);
		const anchor = div.querySelector("a");
		expect(anchor?.getAttribute("data-id")).toBe("react-email-button");
	});

	it("does not stamp standard text links", () => {
		const div = document.createElement("div");
		div.innerHTML = `
			<p>
				<a href="https://example.com" style="color: #0066cc; text-decoration: underline;">
					Regular link
				</a>
			</p>
		`;

		stampFilledLinksAsEmailButtons(div);
		const anchor = div.querySelector("a");
		expect(anchor?.getAttribute("data-id")).toBeNull();
	});
});
