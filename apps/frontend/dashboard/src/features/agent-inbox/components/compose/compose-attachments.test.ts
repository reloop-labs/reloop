import { describe, expect, test } from "vitest";
import { toSendAttachments } from "./compose-attachments";

describe("toSendAttachments", () => {
	test("sends the object key for local MinIO URLs", () => {
		expect(
			toSendAttachments([
				{
					id: "1",
					name: "invoice.pdf",
					size: "12 KB",
					url: "http://localhost:9010/reloop-uploads/uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf",
					path: "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf",
					content_type: "application/pdf",
				},
			]),
		).toEqual([
			{
				filename: "invoice.pdf",
				path: "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf",
				content_type: "application/pdf",
			},
		]);
	});

	test("sends the public s3.reloop.sh URL in production", () => {
		const url =
			"https://s3.reloop.sh/reloop/uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf";
		expect(
			toSendAttachments([
				{
					id: "1",
					name: "invoice.pdf",
					size: "12 KB",
					url,
					path: "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf",
					content_type: "application/pdf",
				},
			]),
		).toEqual([
			{
				filename: "invoice.pdf",
				path: url,
				content_type: "application/pdf",
			},
		]);
	});

	test("skips files that are still uploading", () => {
		expect(
			toSendAttachments([
				{
					id: "1",
					name: "invoice.pdf",
					size: "12 KB",
					url: "",
					path: "",
					content_type: "application/pdf",
					isUploading: true,
				},
			]),
		).toEqual([]);
	});
});
