/**
 * Minimal RFC 5322 / MIME multipart parser for extracting attachments from
 * the stored on-the-wire message (`emailLog.rawMessage`).
 *
 * Dependency-free on purpose: the admin service does not depend on
 * mailparser. It handles what our pipeline produces (nodemailer ·
 * KumoMTA): multipart/mixed|related|alternative with base64 bodies,
 * plus quoted-printable / 7bit fallbacks.
 */

export type ParsedAttachment = {
	filename: string;
	contentType: string;
	contentId: string | null;
	bytes: Buffer;
};

function decodeRfc2047(value: string): string {
	return value.replace(
		/=\?([^?\s]+)\?([bBqQ])\?([^?]*)\?=/g,
		(_m, _charset, enc, text) => {
			if (String(enc).toUpperCase() === "B") {
				try {
					return Buffer.from(String(text), "base64").toString("utf8");
				} catch {
					return text;
				}
			}
			try {
				return decodeQuotedPrintable(String(text).replace(/_/g, " "));
			} catch {
				return text;
			}
		},
	);
}

function decodeQuotedPrintable(input: string): string {
	const withoutSoftBreaks = input.replace(/=\r?\n/g, "");
	const bytes: number[] = [];
	for (let i = 0; i < withoutSoftBreaks.length; i++) {
		const ch = withoutSoftBreaks[i];
		if (
			ch === "=" &&
			i + 2 < withoutSoftBreaks.length &&
			/[0-9A-Fa-f]{2}/.test(withoutSoftBreaks.slice(i + 1, i + 3))
		) {
			bytes.push(Number.parseInt(withoutSoftBreaks.slice(i + 1, i + 3), 16));
			i += 2;
		} else if (ch !== undefined) {
			bytes.push(ch.charCodeAt(0));
		}
	}
	return Buffer.from(bytes).toString("utf8");
}

function parseHeaderBlock(block: string): Map<string, string> {
	const headers = new Map<string, string>();
	const unfolded = block.replace(/\r?\n[ \t]+/g, " ");
	for (const line of unfolded.split(/\r?\n/)) {
		const idx = line.indexOf(":");
		if (idx <= 0) continue;
		const name = line.slice(0, idx).trim().toLowerCase();
		const value = line.slice(idx + 1).trim();
		if (!headers.has(name)) headers.set(name, value);
	}
	return headers;
}

function headerParam(value: string | undefined, param: string): string | null {
	if (!value) return null;
	const re = new RegExp(
		`${param}\\*?=\\s*("(?:[^"\\\\]|\\\\.)*"|[^;\\s]+)`,
		"i",
	);
	const match = value.match(re);
	if (!match?.[1]) return null;
	let raw = match[1].trim();
	if (raw.startsWith('"') && raw.endsWith('"')) {
		raw = raw.slice(1, -1).replace(/\\(.)/g, "$1");
	}
	// RFC 2231 encoded param: charset'lang'value
	const encoded = raw.match(/^([^']*)'[^']*'(.*)$/);
	if (raw.includes("%") && encoded?.[2]) {
		try {
			return decodeURIComponent(encoded[2]);
		} catch {
			return raw;
		}
	}
	return decodeRfc2047(raw);
}

function boundaryFrom(contentType: string | undefined): string | null {
	if (!contentType) return null;
	const match = contentType.match(/boundary="?([^";\s]+)"?/i);
	return match?.[1]?.replace(/"+$/g, "") ?? null;
}

function decodeBody(body: string, encoding: string): Buffer {
	const enc = encoding.trim().toLowerCase();
	if (enc === "base64") {
		const clean = body.replace(/\s/g, "");
		return Buffer.from(clean, "base64");
	}
	if (enc === "quoted-printable") {
		return Buffer.from(decodeQuotedPrintable(body), "utf8");
	}
	return Buffer.from(body.replace(/^\r?\n/, ""), "utf8");
}

function splitParts(body: string, boundary: string): string[] {
	const delimiter = `--${boundary}`;
	const chunks = body.split(delimiter);
	// Drop preamble (before first delimiter) and epilogue (after --boundary--).
	return chunks.slice(1, -1).map((chunk) => {
		let part = chunk.replace(/^\r?\n/, "");
		part = part.replace(/\r?\n$/, "");
		return part;
	});
}

function collectAttachments(
	rawPart: string,
	boundary: string,
	out: ParsedAttachment[],
): void {
	for (const part of splitParts(rawPart, boundary)) {
		const sep = part.search(/\r?\n\r?\n/);
		if (sep < 0) continue;
		const headerBlock = part.slice(0, sep);
		const body = part.slice(sep).replace(/^\r?\n\r?\n/, "");
		const headers = parseHeaderBlock(headerBlock);
		const contentType = headers.get("content-type") ?? "";
		const nestedBoundary = boundaryFrom(contentType);
		if (/^multipart\//i.test(contentType) && nestedBoundary) {
			collectAttachments(body, nestedBoundary, out);
			continue;
		}
		const disposition = headers.get("content-disposition") ?? "";
		const filename =
			headerParam(disposition, "filename") ?? headerParam(contentType, "name");
		if (!filename) continue; // text/html bodies, not attachments
		const mime =
			contentType.split(";")[0]?.trim() || "application/octet-stream";
		const rawCid = headers.get("content-id")?.trim();
		const contentId =
			rawCid?.startsWith("<") && rawCid.endsWith(">")
				? rawCid.slice(1, -1)
				: (rawCid ?? null);
		out.push({
			filename,
			contentType: mime.toLowerCase(),
			contentId,
			bytes: decodeBody(
				body,
				headers.get("content-transfer-encoding") ?? "7bit",
			),
		});
	}
}

/** All file attachments embedded in a raw RFC822 message, in MIME order. */
export function parseMimeAttachments(rawMessage: string): ParsedAttachment[] {
	const sep = rawMessage.search(/\r?\n\r?\n/);
	if (sep < 0) return [];
	const headers = parseHeaderBlock(rawMessage.slice(0, sep));
	const body = rawMessage.slice(sep).replace(/^\r?\n\r?\n/, "");
	const boundary = boundaryFrom(headers.get("content-type"));
	if (!boundary) return [];
	const out: ParsedAttachment[] = [];
	collectAttachments(body, boundary, out);
	return out;
}

export type StoredAttachmentMeta = {
	id: string;
	filename: string;
	contentId?: string | null;
};

/**
 * Match a stored attachment row to its bytes in the MIME payload.
 * Prefers exact filename, then content-ID, then MIME order fallback.
 */
export function findMimeAttachment(
	rawMessage: string,
	meta: StoredAttachmentMeta,
	fallbackIndex: number,
): ParsedAttachment | null {
	const parsed = parseMimeAttachments(rawMessage);
	if (parsed.length === 0) return null;
	const byName = parsed.find((p) => p.filename === meta.filename);
	if (byName) return byName;
	if (meta.contentId) {
		const byCid = parsed.find((p) => p.contentId === meta.contentId);
		if (byCid) return byCid;
	}
	return parsed[fallbackIndex] ?? parsed[0] ?? null;
}

/** Strip CR/LF so a filename is safe for Content-Disposition. */
export function sanitizeFilename(filename: string): string {
	return filename.replace(/[\r\n"]/g, "").trim() || "attachment";
}
