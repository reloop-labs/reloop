import {
	type ClickTrackingPayload,
	decodeTrackingToken,
	encodeTrackingToken,
} from "@reloop/be-mail/lib/crypto";
import { mailConfig } from "@reloop/be-mail/mail.config";

export function injectTracking_step5b({
	html,
	emailLogId,
	clickTracking,
	openTracking,
}: {
	html: string | undefined;
	emailLogId: string;
	clickTracking: boolean;
	openTracking: boolean;
}): string | undefined {
	if (!html) return html;

	const baseUrl = mailConfig.BASE_URL.replace(/\/$/, "");
	let result = html;

	// Always rewrite links to use /redirect/, passing clickTracking flag to helper
	result = rewriteLinks(result, emailLogId, baseUrl, clickTracking);

	if (openTracking) {
		result = injectOpenPixel(result, emailLogId, baseUrl);
	}

	return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Replaces every href in <a> tags with a tracking redirect URL.
 * Skips mailto:, tel:, #anchors, and decodes/rewrites already-rewritten tracking URLs.
 */
function rewriteLinks(
	html: string,
	emailLogId: string,
	baseUrl: string,
	clickTracking: boolean,
): string {
	return html.replace(
		/(<a\s[^>]*href=)(["'])([^"']+)\2/gi,
		(match, prefix, quote, originalUrl) => {
			// Skip non-http links
			if (
				!originalUrl.startsWith("http://") &&
				!originalUrl.startsWith("https://")
			) {
				return match;
			}

			// Decode HTML entities — href attributes encode & as &amp;
			let cleanUrl = originalUrl.replace(/&amp;/gi, "&");

			// Check if it is already a redirect URL
			const redirectMatch = cleanUrl.match(/\/redirect\/([^/?#"]+)/);
			if (redirectMatch) {
				const existingToken = redirectMatch[1];
				const decoded = decodeTrackingToken<ClickTrackingPayload>(
					existingToken,
					mailConfig.TRACKING_SECRET,
				);
				if (decoded?.url) {
					cleanUrl = decoded.url;
				} else {
					// Fallback: decode without signature verification
					try {
						const json = Buffer.from(existingToken, "base64url").toString(
							"utf-8",
						);
						const obj = JSON.parse(json) as { url?: string };
						if (obj.url) {
							cleanUrl = obj.url;
						} else {
							return match;
						}
					} catch {
						return match;
					}
				}
			}

			let token: string;
			if (clickTracking) {
				token = encodeTrackingToken(
					{ id: emailLogId, url: cleanUrl },
					mailConfig.TRACKING_SECRET,
				);
			} else {
				token = Buffer.from(JSON.stringify({ url: cleanUrl })).toString(
					"base64url",
				);
			}
			const trackingUrl = `${baseUrl}/redirect/${token}`;

			return `${prefix}${quote}${trackingUrl}${quote}`;
		},
	);
}

/**
 * Appends a 1×1 transparent tracking pixel before </body>.
 * If </body> is not found, appends at the end of the string.
 */
function injectOpenPixel(
	html: string,
	emailLogId: string,
	baseUrl: string,
): string {
	const token = encodeTrackingToken(
		{ id: emailLogId },
		mailConfig.TRACKING_SECRET,
	);
	const pixelUrl = `${baseUrl}/api/mail/v1/track/open/${token}`;
	const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;border:0;" />`;

	const bodyCloseIndex = html.lastIndexOf("</body>");
	if (bodyCloseIndex !== -1) {
		return html.slice(0, bodyCloseIndex) + pixel + html.slice(bodyCloseIndex);
	}

	return html + pixel;
}
