import { describe, expect, test } from "bun:test";
import { serializeSendAttachments } from "../src/lib/email-log-attachments";

describe("serializeSendAttachments", () => {
	test("stores filename and object key for the sent log", () => {
		const stored = serializeSendAttachments([
			{
				filename: "invoice.pdf",
				path: "uploads/2026/08/abc.pdf",
				content_type: "application/pdf",
			},
		]);
		expect(stored).toHaveLength(1);
		expect(stored[0]?.id).toMatch(/^outatt_/);
		expect(stored[0]?.filename).toBe("invoice.pdf");
		expect(stored[0]?.storagePath).toBe("uploads/2026/08/abc.pdf");
		expect(stored[0]?.contentType).toBe("application/pdf");
		expect(stored[0]?.contentDisposition).toBe("attachment");
	});

	test("returns an empty list when nothing was attached", () => {
		expect(serializeSendAttachments(undefined)).toEqual([]);
		expect(serializeSendAttachments([])).toEqual([]);
	});
});
