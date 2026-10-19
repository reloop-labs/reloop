import {
	type ClickTrackingPayload,
	decodeTrackingToken,
	encodeTrackingToken,
} from "@reloop/be-mail/lib/crypto";
import { mailConfig } from "@reloop/be-mail/mail.config";

/**
 * Rewrites HTML email content to inject custom tracking links and open tracking.
 * Used when a custom tracking domain is enabled (isTrackingDomain is true).
 *
 * @param trackingDomain - The FQDN of the tracking domain (e.g. "tracking.example.com")
 */
export function injectCustomTracking_step5c({
	html,
	emailLogId,
	clickTracking,
	openTracking,
	trackingDomain,
}: {
	html: string | undefined;
	emailLogId: string;
	clickTracking: boolean;
	openTracking: boolean;
	trackingDomain: string;
}): string | undefined {
	if (!html) return html;

	if (!trackingDomain) {
		return html;
	}

	const protocol = mailConfig.BASE_URL.startsWith("https://")
		? "https://"
		: "http://";
	const baseUrl = `${protocol}${trackingDomain}`;
	let result = html;

	// With click tracking off, links keep their original destination. Wrapping
	// them through the shared link host would only add a redirect hop that
	// mailbox providers score against the sender.
	if (clickTracking) {
		result = rewriteLinks(result, emailLogId, baseUrl);
	}

	if (openTracking) {
		result = injectOpenPixel(result, emailLogId, baseUrl);
	}

	return result;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rewriteLinks(
	html: string,
	emailLogId: string,
	baseUrl: string,
): string {
	return html.replace(
		/(<a\s[^>]*href=)(["'])([^"']+)\2/gi,
		(match, prefix, quote, originalUrl) => {
			if (
				!originalUrl.startsWith("http://") &&
				!originalUrl.startsWith("https://")
			) {
				return match;
			}

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

			const token = encodeTrackingToken(
				{ id: emailLogId, url: cleanUrl },
				mailConfig.TRACKING_SECRET,
			);
			const trackingUrl = `${baseUrl}/redirect/${token}`;

			return `${prefix}${quote}${trackingUrl}${quote}`;
		},
	);
}

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
