import { contactsConfig } from "@be/contacts/contacts.config";
import { EXPORT_LINK_TTL_MS } from "@be/contacts/routes/contact/export-contacts/export-query";

const EXPORT_DOWNLOAD_SECRET = contactsConfig.EXPORT_DOWNLOAD_SECRET;

export interface ExportDownloadTokenPayload {
	exportId: string;
	organizationId: string;
	expiresAt: number; // Unix timestamp in ms
}

async function getKey(secret: string): Promise<CryptoKey> {
	const enc = new TextEncoder();
	return crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}

function base64UrlEncode(data: Uint8Array): string {
	return btoa(String.fromCharCode(...data))
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
}

function base64UrlDecode(str: string): Uint8Array {
	const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64.padEnd(
		base64.length + ((4 - (base64.length % 4)) % 4),
		"=",
	);
	const binary = atob(padded);
	return new Uint8Array([...binary].map((c) => c.charCodeAt(0)));
}

export async function signExportDownloadToken(payload: {
	exportId: string;
	organizationId: string;
}): Promise<{ token: string; expiresAt: number }> {
	const expiresAt = Date.now() + EXPORT_LINK_TTL_MS;
	const data: ExportDownloadTokenPayload = { ...payload, expiresAt };
	const enc = new TextEncoder();
	const encodedPayload = base64UrlEncode(enc.encode(JSON.stringify(data)));

	const key = await getKey(EXPORT_DOWNLOAD_SECRET);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		enc.encode(encodedPayload),
	);

	return {
		token: `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`,
		expiresAt,
	};
}

export async function verifyExportDownloadToken(
	token: string,
): Promise<ExportDownloadTokenPayload | null> {
	try {
		const parts = token.split(".");
		if (parts.length !== 2) return null;

		const [encodedPayload, encodedSig] = parts;
		if (!encodedPayload || !encodedSig) return null;

		const enc = new TextEncoder();
		const key = await getKey(EXPORT_DOWNLOAD_SECRET);

		const sigBytes = base64UrlDecode(encodedSig);
		const isValid = await crypto.subtle.verify(
			"HMAC",
			key,
			sigBytes.buffer as ArrayBuffer,
			enc.encode(encodedPayload),
		);
		if (!isValid) return null;

		const payloadStr = new TextDecoder().decode(
			base64UrlDecode(encodedPayload),
		);
		const data = JSON.parse(payloadStr) as ExportDownloadTokenPayload;
		if (!data.exportId || !data.organizationId) return null;
		if (Date.now() > data.expiresAt) return null;

		return data;
	} catch {
		return null;
	}
}
