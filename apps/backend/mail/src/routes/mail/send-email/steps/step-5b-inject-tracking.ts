import { encodeTrackingToken } from "@reloop/be-mail/lib/crypto";
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

	if (clickTracking) {
		result = rewriteLinks(result, emailLogId, baseUrl);
	}

	if (openTracking) {
		result = injectOpenPixel(result, emailLogId, baseUrl);
	}

	return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Replaces every href in <a> tags with a tracking redirect URL.
 * Skips mailto:, tel:, #anchors, and already-rewritten tracking URLs.
 */
function rewriteLinks(
	html: string,
	emailLogId: string,
	baseUrl: string,
): string {
	return html.replace(
		/(<a\s[^>]*href=)(["'])([^"']+)\2/gi,
		(match, prefix, quote, originalUrl) => {
			// Skip non-http links and already-rewritten tracking URLs
			if (
				!originalUrl.startsWith("http://") &&
				!originalUrl.startsWith("https://")
			) {
				return match;
			}
			if (originalUrl.includes(`${baseUrl}/redirect/`)) {
				return match;
			}

			// Decode HTML entities — href attributes encode & as &amp;
			const cleanUrl = originalUrl.replace(/&amp;/gi, "&");
			const token = encodeTrackingToken(
				{ id: emailLogId, url: cleanUrl },
				mailConfig.TRACKING_SECRET,
			);
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
