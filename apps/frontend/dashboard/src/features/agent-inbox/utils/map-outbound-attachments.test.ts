import { describe, expect, test } from "vitest";
import {
	hasVisibleAttachments,
	isInlineAttachment,
	mapOutboundAttachments,
} from "./map-outbound-attachments";

describe("isInlineAttachment", () => {
	test("does not treat content-id alone as inline", () => {
		expect(
			isInlineAttachment({
				contentDisposition: "attachment",
			}),
		).toBe(false);
	});

	test("treats explicit inline disposition as inline", () => {
		expect(
			isInlineAttachment({
				contentDisposition: "inline",
			}),
		).toBe(true);
	});

	test("respects the isInline flag", () => {
		expect(isInlineAttachment({ isInline: true })).toBe(true);
		expect(isInlineAttachment({ isInline: false })).toBe(false);
	});
});

describe("mapOutboundAttachments", () => {
	test("keeps file attachments visible even when they have a content id", () => {
		const mapped = mapOutboundAttachments([
			{
				filename: "invoice.pdf",
				contentType: "application/pdf",
				size: 2048,
				contentDisposition: "attachment",
				contentId: "cid:invoice@reloop",
			},
		]);
		expect(mapped).toEqual([
			{
				name: "invoice.pdf",
				size: "2.0 KB",
				contentType: "application/pdf",
				isInline: false,
			},
		]);
		expect(hasVisibleAttachments(mapped)).toBe(true);
	});

	test("hides cid images with inline disposition", () => {
		const mapped = mapOutboundAttachments([
			{
				filename: "logo.png",
				contentDisposition: "inline",
				contentId: "logo",
			},
		]);
		expect(mapped[0]?.isInline).toBe(true);
		expect(hasVisibleAttachments(mapped)).toBe(false);
	});

	test("returns empty for missing input", () => {
		expect(mapOutboundAttachments(undefined)).toEqual([]);
		expect(hasVisibleAttachments(undefined)).toBe(false);
	});
});
