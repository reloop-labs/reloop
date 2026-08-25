import { type HeaderValue, type ParsedMail, simpleParser } from "mailparser";

export interface ParsedEmailData {
	from: {
		address: string;
		name: string;
		domain: string;
	};
	to: {
		address: string;
		name: string;
	};
	subject: string;
	messageId: string | null;
	date: Date | null;
	text: string;
	html: string;
	headers: Record<string, string>;
	rawHeaders: Array<{ key: string; value: string }>;
	receivedHeaders: string[];
	connectingIp: string | null;
	heloDomain: string | null;
	returnPath: string | null;
	dkimSignatures: string[];
	rspamdScore: number | null;
	rspamdAction: string | null;
	rspamdSymbols: string[];
	attachments: Array<{
		filename?: string;
		contentType: string;
		size: number;
	}>;
	rawMime: string;
}

/**
 * Extract connecting IPv4/IPv6 from Received headers
 */
function extractConnectingIp(receivedHeaders: string[]): {
	ip: string | null;
	helo: string | null;
} {
	// Look through Received headers (bottom-most or most recent external MTA hop)
	for (const header of receivedHeaders) {
		// Pattern: from helo_domain (rdns [ip]) or from [ip] or from helo (ip)
		const ipMatch = header.match(
			/\[(?:IPv6:)?([0-9a-fA-F:.]+)\]|\b(?<!\.)(\d{1,3}(?:\.\d{1,3}){3})(?!\.)\b/,
		);
		const heloMatch = header.match(/^from\s+([^\s(]+)/i);

		if (ipMatch) {
			const ip = ipMatch[1] || ipMatch[2];
			// Ignore loopback if other hops exist
			if (ip && !ip.startsWith("127.") && ip !== "::1") {
				return {
					ip,
					helo: heloMatch && heloMatch[1] ? heloMatch[1].trim() : null,
				};
			}
		}
	}

	// Fallback: check first received header even if localhost
	if (receivedHeaders.length > 0 && receivedHeaders[0]) {
		const header = receivedHeaders[0];
		const ipMatch = header.match(/\[([0-9a-fA-F:.]+)\]/);
		const heloMatch = header.match(/^from\s+([^\s(]+)/i);
		return {
			ip: ipMatch && ipMatch[1] ? ipMatch[1] : null,
			helo: heloMatch && heloMatch[1] ? heloMatch[1].trim() : null,
		};
	}

	return { ip: null, helo: null };
}

export async function parseMime(rawMime: string): Promise<ParsedEmailData> {
	const parsed: ParsedMail = await simpleParser(rawMime);

	const headersRecord: Record<string, string> = {};
	const rawHeaders: Array<{ key: string; value: string }> = [];
	const receivedHeaders: string[] = [];
	const dkimSignatures: string[] = [];

	if (parsed.headerLines) {
		for (const hl of parsed.headerLines) {
			const key = hl.key.toLowerCase();
			const val = hl.line.replace(/^[^:]+:\s*/i, "").trim();
			rawHeaders.push({ key: hl.key, value: val });

			if (!headersRecord[key]) {
				headersRecord[key] = val;
			}

			if (key === "received") {
				receivedHeaders.push(val);
			} else if (key === "dkim-signature") {
				dkimSignatures.push(val);
			}
		}
	}

	// Extract Return-Path
	const returnPathHeader = headersRecord["return-path"] || "";
	const returnPathMatch = returnPathHeader.match(/<([^>]+)>/) || [
		null,
		returnPathHeader,
	];
	const returnPath = (returnPathMatch[1] || "").trim() || null;

	// Extract From
	const fromAddress = parsed.from?.value?.[0]?.address || "";
	const fromName = parsed.from?.value?.[0]?.name || "";
	const fromDomain = fromAddress.includes("@")
		? (fromAddress.split("@")[1] || "").toLowerCase()
		: "";

	// Extract To
	const toAddress =
		(Array.isArray(parsed.to)
			? parsed.to[0]?.value?.[0]?.address
			: parsed.to?.value?.[0]?.address) || "";
	const toName =
		(Array.isArray(parsed.to)
			? parsed.to[0]?.value?.[0]?.name
			: parsed.to?.value?.[0]?.name) || "";

	// Extract Connecting IP and HELO
	const { ip: connectingIp, helo: heloDomain } =
		extractConnectingIp(receivedHeaders);

	// Extract Rspamd info injected by KumoMTA
	const rawSpamScore = headersRecord["x-spam-score"];
	const rspamdScore = rawSpamScore ? Number.parseFloat(rawSpamScore) : null;
	const rspamdAction = headersRecord["x-spam-action"] || null;

	const rspamdStatus = headersRecord["x-spam-status"] || "";
	const symbolsMatch = rspamdStatus.match(/tests=([^\s]+)/);
	const rspamdSymbols =
		symbolsMatch && symbolsMatch[1]
			? symbolsMatch[1]
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean)
			: [];

	const attachments = (parsed.attachments || []).map((att) => ({
		filename: att.filename,
		contentType: att.contentType,
		size: att.size,
	}));

	return {
		from: {
			address: fromAddress,
			name: fromName,
			domain: fromDomain,
		},
		to: {
			address: toAddress,
			name: toName,
		},
		subject: parsed.subject || "",
		messageId: parsed.messageId || null,
		date: parsed.date || null,
		text: typeof parsed.text === "string" ? parsed.text : "",
		html: typeof parsed.html === "string" ? parsed.html : "",
		headers: headersRecord,
		rawHeaders,
		receivedHeaders,
		connectingIp,
		heloDomain,
		returnPath,
		dkimSignatures,
		rspamdScore: Number.isNaN(rspamdScore) ? null : rspamdScore,
		rspamdAction,
		rspamdSymbols,
		attachments,
		rawMime,
	};
}
