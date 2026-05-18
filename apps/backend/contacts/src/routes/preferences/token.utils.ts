const PREFERENCES_SECRET =
	process.env.PREFERENCES_SECRET ||
	"reloop-preferences-secret-key-change-in-prod";

const TOKEN_EXPIRY_DAYS = 30;

export interface PreferencesTokenPayload {
	contactId: string;
	organizationId: string;
	expiresAt: number; // Unix timestamp in ms
}

async function getKey(secret: string): Promise<CryptoKey> {
	const enc = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		enc.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
	return keyMaterial;
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

export async function signToken(
	payload: PreferencesTokenPayload,
): Promise<string> {
	const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
	const data: PreferencesTokenPayload = { ...payload, expiresAt };
	const enc = new TextEncoder();
	const payloadStr = JSON.stringify(data);
	const encodedPayload = base64UrlEncode(enc.encode(payloadStr));

	const key = await getKey(PREFERENCES_SECRET);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		enc.encode(encodedPayload),
	);
	const encodedSig = base64UrlEncode(new Uint8Array(signature));

	return `${encodedPayload}.${encodedSig}`;
}

export async function verifyToken(
	token: string,
): Promise<PreferencesTokenPayload | null> {
	try {
		const parts = token.split(".");
		if (parts.length !== 2) return null;

		const [encodedPayload, encodedSig] = parts;
		if (!encodedPayload || !encodedSig) return null;

		const enc = new TextEncoder();
		const key = await getKey(PREFERENCES_SECRET);

		const sigBytes = base64UrlDecode(encodedSig);
		const isValid = await crypto.subtle.verify(
			"HMAC",
			key,
			sigBytes as any,
			enc.encode(encodedPayload),
		);

		if (!isValid) return null;

		const payloadBytes = base64UrlDecode(encodedPayload);
		const payloadStr = new TextDecoder().decode(payloadBytes);
		const data = JSON.parse(payloadStr) as PreferencesTokenPayload;

		if (Date.now() > data.expiresAt) return null;

		return data;
	} catch {
		return null;
	}
}
