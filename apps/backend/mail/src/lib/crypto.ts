import { createHmac } from "node:crypto";

/**
 * Generates a short signature for a URL to prevent Open Redirect attacks.
 */
export function signTrackingUrl(url: string, secret: string): string {
	return createHmac("sha256", secret).update(url).digest("hex").slice(0, 16);
}
