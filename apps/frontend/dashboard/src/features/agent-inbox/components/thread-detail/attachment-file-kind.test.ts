import { describe, expect, test } from "vitest";
import {
	attachmentFileKind,
	attachmentKindLabel,
} from "./attachment-file-kind";

describe("attachmentFileKind", () => {
	test("detects pdf from filename", () => {
		expect(attachmentFileKind("invoice.pdf")).toBe("pdf");
		expect(attachmentKindLabel("pdf")).toBe("PDF");
	});

	test("detects images from content type when extension is missing", () => {
		expect(attachmentFileKind("photo", "image/png")).toBe("img");
	});

	test("falls back to file", () => {
		expect(attachmentFileKind("notes")).toBe("file");
		expect(attachmentKindLabel("file")).toBe("FILE");
	});
});
