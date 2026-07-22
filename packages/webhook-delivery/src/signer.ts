import { createHmac, timingSafeEqual } from "node:crypto";
import {
	HEADER_ID,
	HEADER_SIGNATURE,
	HEADER_TIMESTAMP,
	RESERVED_HEADER_NAMES,
	WEBHOOK_USER_AGENT,
} from "./constants";

/**
 * Sign body with HMAC-SHA256.
 * Signed string: `${timestamp}.${rawBody}`
 */
export function signWebhookBody(
	secret: string,
	rawBody: string,
	timestampSeconds: number,
): string {
	return createHmac("sha256", secret)
		.update(`${timestampSeconds}.${rawBody}`)
		.digest("hex");
}

export function formatSignatureHeader(
	timestampSeconds: number,
	signatureHex: string,
): string {
	return `t=${timestampSeconds},v1=${signatureHex}`;
}

export function parseSignatureHeader(
	header: string,
): { timestamp: number; v1: string } | null {
	const parts = header.split(",").map((p) => p.trim());
	let timestamp: number | undefined;
	let v1: string | undefined;
	for (const part of parts) {
		const eq = part.indexOf("=");
		if (eq <= 0) continue;
		const key = part.slice(0, eq);
		const value = part.slice(eq + 1);
		if (key === "t") timestamp = Number(value);
		if (key === "v1") v1 = value;
	}
	if (timestamp === undefined || !Number.isFinite(timestamp) || !v1) {
		return null;
	}
	return { timestamp, v1 };
}

/** Verify a received webhook (for tests / customer SDK reference). */
export function verifyWebhookSignature(input: {
	secret: string;
	rawBody: string;
	signatureHeader: string;
	/** Max age of timestamp in seconds (default 5 minutes). */
	toleranceSeconds?: number;
	nowSeconds?: number;
}): boolean {
	const parsed = parseSignatureHeader(input.signatureHeader);
	if (!parsed) return false;

	const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
	const tolerance = input.toleranceSeconds ?? 300;
	if (Math.abs(now - parsed.timestamp) > tolerance) return false;

	const expected = signWebhookBody(
		input.secret,
		input.rawBody,
		parsed.timestamp,
	);

	try {
		const a = Buffer.from(expected, "hex");
		const b = Buffer.from(parsed.v1, "hex");
		if (a.length !== b.length) return false;
		return timingSafeEqual(a, b);
	} catch {
		return false;
	}
}

/**
 * Build outbound headers. Custom headers are applied first; reserved names
 * are stripped so signature / content-type cannot be overridden.
 */
export function buildDeliveryHeaders(input: {
	eventId: string;
	timestampSeconds: number;
	signatureHex: string;
	customHeaders?: Record<string, string> | null;
}): Record<string, string> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		"User-Agent": WEBHOOK_USER_AGENT,
	};

	if (input.customHeaders) {
		for (const [key, value] of Object.entries(input.customHeaders)) {
			if (RESERVED_HEADER_NAMES.has(key.toLowerCase())) continue;
			headers[key] = value;
		}
	}

	headers[HEADER_ID] = input.eventId;
	headers[HEADER_TIMESTAMP] = String(input.timestampSeconds);
	headers[HEADER_SIGNATURE] = formatSignatureHeader(
		input.timestampSeconds,
		input.signatureHex,
	);

	return headers;
}
