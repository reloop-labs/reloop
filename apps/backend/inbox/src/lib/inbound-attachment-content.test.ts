import { describe, expect, test } from "bun:test";
import { simpleParser } from "mailparser";
import {
	attachmentResponse,
	extractInboundAttachmentContent,
	forwardableInboundAttachments,
} from "./inbound-attachment-content";

const pdfBytes = Buffer.from("%PDF-1.4 fake pdf body");
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3]);

const raw = [
	"From: a@example.com",
	"To: b@example.com",
	"Subject: files",
	"MIME-Version: 1.0",
	'Content-Type: multipart/mixed; boundary="b1"',
	"",
	"--b1",
	"Content-Type: text/html; charset=utf-8",
	"",
	'<p>hi <img src="cid:logo@x"></p>',
	"--b1",
	'Content-Type: application/pdf; name="invoice.pdf"',
	'Content-Disposition: attachment; filename="invoice.pdf"',
	"Content-Transfer-Encoding: base64",
	"",
	pdfBytes.toString("base64"),
	"--b1",
	"Content-Type: image/png",
	"Content-Disposition: inline",
	"Content-ID: <logo@x>",
	"Content-Transfer-Encoding: base64",
	"",
	pngBytes.toString("base64"),
	"--b1--",
	"",
].join("\r\n");

describe("extractInboundAttachmentContent", () => {
	test("returns bytes matched by checksum, as stored at receive time", async () => {
		const parsed = await simpleParser(raw);
		const pdf = parsed.attachments.find((a) => a.filename === "invoice.pdf");
		const file = await extractInboundAttachmentContent(raw, {
			filename: "invoice.pdf",
			contentType: "application/pdf",
			size: pdf?.size ?? 0,
			contentId: null,
			checksum: pdf?.checksum ?? null,
		});
		expect(file?.content.equals(pdfBytes)).toBe(true);
	});

	test("matches inline images by content-id", async () => {
		const file = await extractInboundAttachmentContent(raw, {
			filename: "unnamed",
			contentType: "image/png",
			size: 0,
			contentId: "<logo@x>",
			checksum: null,
		});
		expect(file?.content.equals(pngBytes)).toBe(true);
	});

	test("returns null when nothing matches", async () => {
		const file = await extractInboundAttachmentContent(raw, {
			filename: "missing.zip",
			contentType: "application/zip",
			size: 1,
			contentId: null,
			checksum: "nope",
		});
		expect(file).toBeNull();
	});
});

describe("attachmentResponse", () => {
	test("forces non-images to download", () => {
		const res = attachmentResponse(
			{
				filename: "x.html",
				contentType: "text/html",
				content: Buffer.from("<script>"),
			},
			true,
		);
		expect(res.headers.get("content-type")).toBe("application/octet-stream");
		expect(res.headers.get("content-disposition")).toStartWith("attachment;");
	});

	test("renders images inline on request and escapes the filename", () => {
		const res = attachmentResponse(
			{
				filename: 'ré"sumé.png',
				contentType: "image/png",
				content: pngBytes,
			},
			true,
		);
		expect(res.headers.get("content-type")).toBe("image/png");
		expect(res.headers.get("content-disposition")).toBe(
			`inline; filename="r__sum_.png"; filename*=UTF-8''r%C3%A9_sum%C3%A9.png`,
		);
	});
});

describe("forwardableInboundAttachments", () => {
	test("includes everything by default", async () => {
		const out = await forwardableInboundAttachments(raw);
		expect(out.map((a) => a.filename)).toEqual(["invoice.pdf", "attachment"]);
		expect(out[1]?.content_id).toBe("logo@x");
	});

	test("an empty selection still keeps images the body embeds", async () => {
		const out = await forwardableInboundAttachments(raw, []);
		expect(out.map((a) => a.content_type)).toEqual(["image/png"]);
	});

	test("keeps selected files", async () => {
		const out = await forwardableInboundAttachments(raw, [
			{
				filename: "invoice.pdf",
				contentType: "application/pdf",
				size: pdfBytes.length,
				contentId: null,
				checksum: null,
			},
		]);
		expect(out).toHaveLength(2);
		expect(Buffer.from(out[0]?.content ?? "", "base64").equals(pdfBytes)).toBe(
			true,
		);
	});
});
