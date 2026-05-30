import crypto from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes for GCM
const PREFIX = "enc:";

// Get the key from env
const getEncryptionKey = (): Buffer | null => {
	const keyStr = process.env.WEBHOOK_ENCRYPTION_KEY;
	if (!keyStr) {
		return null;
	}

	// The key could be a 64-character hex string (representing 32 bytes)
	if (/^[0-9a-fA-F]{64}$/.test(keyStr)) {
		return Buffer.from(keyStr, "hex");
	}

	// Or it could be a raw 32-byte string
	const buffer = Buffer.from(keyStr, "utf8");
	if (buffer.length === 32) {
		return buffer;
	}

	console.warn(
		`WEBHOOK_ENCRYPTION_KEY is configured but its length is ${buffer.length} bytes (expected 32 bytes or 64 hex chars). Falling back to plaintext.`,
	);
	return null;
};

export function encryptSecret(plaintext: string): string {
	if (!plaintext) return plaintext;

	const key = getEncryptionKey();
	if (!key) {
		return plaintext;
	}

	try {
		const iv = crypto.randomBytes(IV_LENGTH);
		const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
		let ciphertext = cipher.update(plaintext, "utf8", "hex");
		ciphertext += cipher.final("hex");
		const tag = cipher.getAuthTag();

		return `${PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${ciphertext}`;
	} catch (error) {
		console.error("Failed to encrypt webhook secret:", error);
		return plaintext;
	}
}

export function decryptSecret(ciphertext: string): string {
	if (!ciphertext || !ciphertext.startsWith(PREFIX)) {
		return ciphertext;
	}

	const key = getEncryptionKey();
	if (!key) {
		console.warn(
			"Attempted to decrypt secret but WEBHOOK_ENCRYPTION_KEY is not configured.",
		);
		return ciphertext;
	}

	try {
		const parts = ciphertext.slice(PREFIX.length).split(":");
		if (parts.length !== 3) {
			console.warn("Invalid encrypted secret format. Returning ciphertext.");
			return ciphertext;
		}

		const [ivHex, tagHex, encryptedTextHex] = parts;
		if (!ivHex || !tagHex || !encryptedTextHex) {
			console.warn("Invalid encrypted secret format. Returning ciphertext.");
			return ciphertext;
		}

		const iv = Buffer.from(ivHex, "hex");
		const tag = Buffer.from(tagHex, "hex");
		const encryptedText = Buffer.from(encryptedTextHex, "hex");

		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(tag);
		let decrypted = decipher.update(encryptedText, undefined, "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch (error) {
		console.error("Failed to decrypt webhook secret:", error);
		return ciphertext;
	}
}
