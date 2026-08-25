import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import MailComposer from "nodemailer/lib/mail-composer";
import {
	materializeAttachments,
	s3KeyFromAttachmentPath,
} from "../src/lib/resolve-attachments";

const PDF_BYTES = Buffer.from("%PDF-1.4 test attachment");

describe("s3KeyFromAttachmentPath", () => {
	test("extracts upload keys from relative, docker, and public URLs", () => {
		const key = "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf";
		expect(s3KeyFromAttachmentPath(key)).toBe(key);
		expect(s3KeyFromAttachmentPath(`/app/${key}`)).toBe(key);
		expect(s3KeyFromAttachmentPath(`https://s3.reloop.sh/reloop/${key}`)).toBe(
			key,
		);
		expect(
			s3KeyFromAttachmentPath(`http://localhost:9010/reloop-uploads/${key}`),
		).toBe(key);
	});

	test("returns null for unrelated paths", () => {
		expect(s3KeyFromAttachmentPath("/tmp/invoice.pdf")).toBeNull();
		expect(s3KeyFromAttachmentPath("https://example.com/file.pdf")).toBeNull();
	});
});

describe("materializeAttachments", () => {
	test("loads S3 object keys instead of opening them as local files", async () => {
		const key = "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf";
		const resolved = await materializeAttachments(
			[
				{
					filename: "invoice.pdf",
					path: key,
					content_type: "application/pdf",
				},
			],
			{
				get: async (objectKey) => {
					expect(objectKey).toBe(key);
					return PDF_BYTES;
				},
			},
		);

		expect(resolved).toHaveLength(1);
		expect(resolved[0]?.path).toBeUndefined();
		expect(Buffer.isBuffer(resolved[0]?.content)).toBe(true);
		expect(resolved[0]?.content).toEqual(PDF_BYTES);

		const mime = await new MailComposer({
			from: "a@example.com",
			to: "b@example.com",
			subject: "Invoice",
			text: "attached",
			attachments: resolved,
		})
			.compile()
			.build();
		const raw = mime.toString();
		expect(raw).not.toMatch(/ENOENT/);
		expect(raw).toContain("invoice.pdf");
		expect(raw).toContain("application/pdf");
	});

	test("treats Docker /app/uploads paths as S3 keys", async () => {
		const key = "uploads/2026/08/ny98eiiwx0rri30is799mkxk.pdf";
		const resolved = await materializeAttachments(
			[{ filename: "invoice.pdf", path: `/app/${key}` }],
			{ get: async () => PDF_BYTES },
		);
		expect(resolved[0]?.content).toEqual(PDF_BYTES);
		expect(resolved[0]?.path).toBeUndefined();
	});

	test("keeps inline content and does not hit storage", async () => {
		const resolved = await materializeAttachments(
			[{ filename: "note.txt", content: "hello", content_type: "text/plain" }],
			{
				get: async () => {
					throw new Error("storage should not be called");
				},
			},
		);
		expect(resolved[0]?.content).toBe("hello");
		expect(resolved[0]?.path).toBeUndefined();
	});

	test("reads an existing local file", async () => {
		const dir = join(tmpdir(), `reloop-mail-att-${Date.now()}`);
		mkdirSync(dir, { recursive: true });
		const filePath = join(dir, "local.txt");
		writeFileSync(filePath, "from-disk");
		try {
			const resolved = await materializeAttachments(
				[{ filename: "local.txt", path: filePath, content_type: "text/plain" }],
				{
					get: async () => {
						throw new Error("storage should not be called");
					},
				},
			);
			expect(Buffer.isBuffer(resolved[0]?.content)).toBe(true);
			expect(resolved[0]?.content?.toString()).toBe("from-disk");
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	});

	test("throws a load error instead of raw ENOENT when the object is missing", async () => {
		expect(
			materializeAttachments(
				[
					{
						filename: "missing.pdf",
						path: "uploads/2026/08/does-not-exist.pdf",
					},
				],
				{
					get: async () => {
						throw new Error("The specified key does not exist.");
					},
				},
			),
		).rejects.toMatchObject({
			message: "Attachment could not be loaded",
		});
	});
});
