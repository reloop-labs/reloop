import { createHmac } from "node:crypto";

/**
 * Generates a short signature for a URL to prevent Open Redirect attacks.
 */
export function signTrackingUrl(url: string, secret: string): string {
	return createHmac("sha256", secret).update(url).digest("hex").slice(0, 16);
}

// ─── Single-token tracking helpers ───────────────────────────────────────────

export interface OpenTrackingPayload {
	/** emailLogId */
	id: string;
}

export interface ClickTrackingPayload {
	/** emailLogId */
	id: string;
	/** destination URL */
	url: string;
}

/**
 * Creates a single, tamper-proof base64url token that embeds all tracking
 * parameters (emailLogId, optional destination URL) + an HMAC signature.
 *
 * Token layout (JSON → base64url, no padding):
 *   { id, [url], s }            where s = HMAC-SHA256(id [+ url])
 */
export function encodeTrackingToken(
	payload: OpenTrackingPayload | ClickTrackingPayload,
	secret: string,
): string {
	const signedContent =
		"url" in payload ? `${payload.id}:${payload.url}` : payload.id;

	const sig = createHmac("sha256", secret)
		.update(signedContent)
		.digest("hex")
		.slice(0, 16);

	const tokenObj: Record<string, string> =
		"url" in payload
			? { id: payload.id, url: payload.url, s: sig }
			: { id: payload.id, s: sig };

	return Buffer.from(JSON.stringify(tokenObj))
		.toString("base64url"); // base64url = URL-safe, no padding
}

/**
 * Decodes and verifies a tracking token. Returns the payload if the
 * signature is valid, or `null` if the token is malformed / tampered.
 */
export function decodeTrackingToken<
	T extends OpenTrackingPayload | ClickTrackingPayload,
>(token: string, secret: string): T | null {
	try {
		const json = Buffer.from(token, "base64url").toString("utf-8");
		const obj = JSON.parse(json) as T & { s: string };

		if (!obj.id || !obj.s) return null;

		const signedContent =
			"url" in obj && obj.url ? `${obj.id}:${obj.url}` : obj.id;

		const expectedSig = createHmac("sha256", secret)
			.update(signedContent)
			.digest("hex")
			.slice(0, 16);

		if (obj.s !== expectedSig) return null;

		// Strip the signature from the returned payload
		const { s: _, ...payload } = obj;
		return payload as unknown as T;
	} catch {
		return null;
	}
}
