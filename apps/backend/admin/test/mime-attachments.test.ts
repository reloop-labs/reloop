import { describe, expect, test } from "bun:test";
import {
	findMimeAttachment,
	parseMimeAttachments,
	sanitizeFilename,
} from "../src/lib/mime-attachments";

const PDF_CONTENT = "%PDF-1.4 fake pdf bytes for test";
const PDF_B64 = Buffer.from(PDF_CONTENT, "utf8").toString("base64");

const RAW = [
	'From: "Iron Will Capital" <mail@mail.ironwillcapital.net>',
	"To: illarecords@yahoo.com",
	"Subject: Cashout summary",
	"MIME-Version: 1.0",
	'Content-Type: multipart/mixed; boundary="----boundary123"',
	"",
	"------boundary123",
	'Content-Type: text/plain; charset="utf-8"',
	"Content-Transfer-Encoding: 7bit",
	"",
	"See attached.",
	"------boundary123",
	'Content-Type: application/pdf; name="Equipment_Cashout_Summary.pdf"',
	"Content-Transfer-Encoding: base64",
	'Content-Disposition: attachment; filename="Equipment_Cashout_Summary.pdf"',
	"",
	PDF_B64,
	"------boundary123--",
	"",
].join("\r\n");

describe("parseMimeAttachments", () => {
	test("extracts a base64 pdf with filename and bytes", () => {
		const parsed = parseMimeAttachments(RAW);
		expect(parsed).toHaveLength(1);
		expect(parsed[0]?.filename).toBe("Equipment_Cashout_Summary.pdf");
		expect(parsed[0]?.contentType).toBe("application/pdf");
		expect(parsed[0]?.bytes.toString("utf8")).toBe(PDF_CONTENT);
	});

	test("returns empty for non-multipart messages", () => {
		expect(parseMimeAttachments("Subject: hi\r\n\r\njust text")).toHaveLength(
			0,
		);
	});
});

describe("findMimeAttachment", () => {
	test("matches stored meta by filename", () => {
		const match = findMimeAttachment(
			RAW,
			{ id: "outatt_1", filename: "Equipment_Cashout_Summary.pdf" },
			0,
		);
		expect(match?.bytes.toString("utf8")).toBe(PDF_CONTENT);
	});

	test("returns null when nothing matches", () => {
		expect(
			findMimeAttachment(
				"Subject: hi\r\n\r\njust text",
				{
					id: "outatt_1",
					filename: "missing.pdf",
				},
				0,
			),
		).toBeNull();
	});
});

describe("sanitizeFilename", () => {
	test("strips CRLF to prevent header injection", () => {
		expect(sanitizeFilename("a.pdf\r\nX-Injected: 1")).toBe(
			"a.pdfX-Injected: 1",
		);
	});
});
