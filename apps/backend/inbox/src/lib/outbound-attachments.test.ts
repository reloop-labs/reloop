import { describe, expect, test } from "bun:test";
import { mapEmailLogAttachments } from "./outbound-attachments";

describe("mapEmailLogAttachments", () => {
	test("normalizes stored outbound metadata", () => {
		expect(
			mapEmailLogAttachments([
				{
					id: "outatt_1",
					filename: "photo.png",
					contentType: "image/png",
					size: 1200,
					storagePath: "uploads/2026/08/photo.png",
					contentDisposition: "attachment",
					contentId: null,
				},
			]),
		).toEqual([
			{
				id: "outatt_1",
				filename: "photo.png",
				contentType: "image/png",
				size: 1200,
				storagePath: "uploads/2026/08/photo.png",
				contentDisposition: "attachment",
				contentId: null,
			},
		]);
	});

	test("returns empty for missing values", () => {
		expect(mapEmailLogAttachments(null)).toEqual([]);
		expect(mapEmailLogAttachments(undefined)).toEqual([]);
	});
});
