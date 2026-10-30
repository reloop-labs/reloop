import { type Attachment, simpleParser } from "mailparser";

export type StoredInboundAttachment = {
	filename: string;
	contentType: string;
	size: number;
	contentId: string | null;
	checksum: string | null;
};

export type InboundAttachmentContent = {
	filename: string;
	contentType: string;
	content: Buffer;
};

const normalizeCid = (cid: string | null | undefined): string =>
	(cid ?? "").trim().replace(/^<|>$/g, "").toLowerCase();

/**
 * Pick the MIME part that a stored `inbound_attachment` row was created from.
 * Rows only hold metadata; the bytes live in `inbound_email.raw_message`.
 * Exported for tests.
 */
export function matchInboundAttachment(
	parts: Attachment[],
	stored: StoredInboundAttachment,
): Attachment | undefined {
	if (stored.checksum) {
		const byChecksum = parts.find((p) => p.checksum === stored.checksum);
		if (byChecksum) return byChecksum;
	}
	const cid = normalizeCid(stored.contentId);
	if (cid) {
		const byCid = parts.find((p) => normalizeCid(p.contentId) === cid);
		if (byCid) return byCid;
	}
	return (
		parts.find(
			(p) =>
				(p.filename || "unnamed") === stored.filename && p.size === stored.size,
		) ?? parts.find((p) => (p.filename || "unnamed") === stored.filename)
	);
}

/** Extract an inbound attachment's bytes from the stored raw RFC822 message. */
export async function extractInboundAttachmentContent(
	rawMessage: string,
	stored: StoredInboundAttachment,
): Promise<InboundAttachmentContent | null> {
	const parsed = await simpleParser(rawMessage);
	const part = matchInboundAttachment(parsed.attachments ?? [], stored);
	if (!part) return null;
	return {
		filename: stored.filename || part.filename || "attachment",
		contentType:
			stored.contentType || part.contentType || "application/octet-stream",
		content: part.content,
	};
}

// Only images are safe to render inline from our origin; everything else
// (HTML, SVG, PDF with scripts...) is forced to download.
const INLINE_SAFE_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/jpg",
	"image/gif",
	"image/webp",
	"image/avif",
	"image/bmp",
]);

/** Build a download response with headers that can't be used for XSS. */
export function attachmentResponse(
	file: InboundAttachmentContent,
	wantInline: boolean,
): Response {
	const contentType =
		file.contentType.toLowerCase().split(";")[0]?.trim() ?? "";
	const inline = wantInline && INLINE_SAFE_TYPES.has(contentType);
	const safeName = file.filename.replace(/[\r\n"\\]/g, "_");
	const asciiName = safeName.replace(/[^\x20-\x7e]/g, "_");
	return new Response(new Uint8Array(file.content), {
		status: 200,
		headers: {
			"content-type": inline ? contentType : "application/octet-stream",
			"content-length": String(file.content.byteLength),
			"content-disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
			"x-content-type-options": "nosniff",
			"content-security-policy": "default-src 'none'; sandbox",
			"cache-control": "private, max-age=3600",
		},
	});
}

export type ForwardAttachment = {
	content?: string;
	filename?: string;
	path?: string;
	content_type?: string;
	content_id?: string;
};

/**
 * Attachments of a received message, base64-encoded for the send API.
 * `selected` = stored rows the user kept (undefined = all). Parts the HTML
 * embeds via `cid:` always go along, or the forwarded body breaks.
 */
export async function forwardableInboundAttachments(
	rawMessage: string,
	selected?: StoredInboundAttachment[],
): Promise<ForwardAttachment[]> {
	// keepCidLinks: by default mailparser inlines cid: images as data: URIs.
	const parsed = await simpleParser(rawMessage, { keepCidLinks: true });
	const parts = parsed.attachments ?? [];
	const html = typeof parsed.html === "string" ? parsed.html.toLowerCase() : "";
	const keep = new Set<Attachment>();
	for (const part of parts) {
		const cid = normalizeCid(part.contentId);
		if (cid && html.includes(`cid:${cid}`)) keep.add(part);
		else if (!selected) keep.add(part);
	}
	for (const row of selected ?? []) {
		const part = matchInboundAttachment(parts, row);
		if (part) keep.add(part);
	}
	return parts
		.filter((part) => keep.has(part))
		.map((att) => ({
			content: att.content.toString("base64"),
			filename: att.filename || "attachment",
			content_type: att.contentType || "application/octet-stream",
			...(att.contentId ? { content_id: normalizeCid(att.contentId) } : {}),
		}));
}
