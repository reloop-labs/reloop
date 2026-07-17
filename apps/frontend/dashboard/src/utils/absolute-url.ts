/**
 * Ensure an asset URL is absolute so <img src> does not resolve it against
 * the app origin (e.g. `s3.reloop.sh/foo` → `https://reloop.sh/s3.reloop.sh/foo`).
 *
 * Upload / S3 endpoints are sometimes configured without a scheme; browsers
 * then treat the host as a relative path.
 */
export function ensureAbsoluteUrl(url: string | null | undefined): string {
	if (!url) return "";
	const trimmed = url.trim();
	if (!trimmed) return "";

	// Local FileReader / object-URL previews
	if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
		return trimmed;
	}

	// Already absolute
	if (/^https?:\/\//i.test(trimmed)) {
		return trimmed;
	}

	// Protocol-relative
	if (trimmed.startsWith("//")) {
		return `https:${trimmed}`;
	}

	// Host/path without scheme: s3.reloop.sh/reloop/uploads/...
	if (/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}([/:?]|$)/i.test(trimmed)) {
		return `https://${trimmed}`;
	}

	return trimmed;
}
