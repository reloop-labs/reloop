import { describe, expect, test } from "bun:test";
import { inlineImageUrls, toAttachmentItems } from "./message-attachments";

const atts = [
	{
		id: "inbatt_pdf",
		filename: "invoice.pdf",
		contentType: "application/pdf",
		size: 2048,
		storagePath: "",
		contentDisposition: "attachment",
		contentId: null,
	},
	{
		id: "inbatt_logo",
		filename: "logo.png",
		contentType: "image/png",
		size: 512,
		storagePath: "",
		// Many senders mark embedded images as attachments; the cid reference decides.
		contentDisposition: "attachment",
		contentId: "<Logo@x>",
	},
];

describe("toAttachmentItems", () => {
	test("hides parts the HTML body embeds and keeps real files", () => {
		const items = toAttachmentItems(atts, {
			messageId: "inb_1",
			html: '<img src="cid:logo@x">',
		});
		expect(items.map((i) => [i.name, i.isInline])).toEqual([
			["invoice.pdf", false],
			["logo.png", true],
		]);
		expect(items[0]?.inboundEmailId).toBe("inb_1");
	});

	test("shows a content-id part as a file when the body doesn't use it", () => {
		const items = toAttachmentItems(atts, { messageId: "inb_1", html: "" });
		expect(items.every((i) => !i.isInline)).toBe(true);
	});
});

describe("inlineImageUrls", () => {
	test("maps normalized content ids to the inline content endpoint", () => {
		expect(inlineImageUrls(atts, "inb_1")).toEqual({
			"logo@x":
				"/api/inbox/v1/messages/inb_1/attachments/inbatt_logo/content?inline=true",
		});
	});
});
