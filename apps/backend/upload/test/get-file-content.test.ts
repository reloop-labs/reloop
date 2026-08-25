import { describe, expect, test } from "bun:test";
import { parseUploadObjectKey } from "../src/lib/parse-upload-key";
import { getFileContentByPath } from "../src/routes/upload/get-file-content/get-file-content.controllers";

const PDF_BYTES = Buffer.from("%PDF-1.4 from upload service");
const KEY = "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf";

describe("parseUploadObjectKey", () => {
	test("accepts relative keys, docker paths, and public URLs", () => {
		expect(parseUploadObjectKey(KEY)).toBe(KEY);
		expect(parseUploadObjectKey(`/app/${KEY}`)).toBe(KEY);
		expect(parseUploadObjectKey(`https://s3.reloop.sh/reloop/${KEY}`)).toBe(
			KEY,
		);
	});

	test("rejects path traversal and unrelated URLs", () => {
		expect(parseUploadObjectKey("uploads/2026/08/../secret.pdf")).toBeNull();
		expect(parseUploadObjectKey("https://example.com/file.pdf")).toBeNull();
	});
});

describe("getFileContentByPath", () => {
	test("returns bytes from storage for an uploaded object key", async () => {
		const result = await getFileContentByPath(KEY, {
			findByPath: async (key) => {
				expect(key).toBe(KEY);
				return { path: KEY, mimeType: "application/pdf" };
			},
			download: async (key) => {
				expect(key).toBe(KEY);
				return PDF_BYTES;
			},
		});
		expect(result.mimeType).toBe("application/pdf");
		expect(result.bytes).toEqual(PDF_BYTES);
	});

	test("extracts the key from a public upload URL", async () => {
		const result = await getFileContentByPath(
			`https://s3.reloop.sh/reloop/${KEY}`,
			{
				findByPath: async (key) => ({
					path: key,
					mimeType: "application/pdf",
				}),
				download: async () => PDF_BYTES,
			},
		);
		expect(result.bytes).toEqual(PDF_BYTES);
	});

	test("throws when the file is not in the upload catalog", async () => {
		expect(
			getFileContentByPath(KEY, {
				findByPath: async () => null,
				download: async () => {
					throw new Error("should not download");
				},
			}),
		).rejects.toMatchObject({ message: "File not found" });
	});
});
