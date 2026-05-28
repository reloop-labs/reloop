import { signTrackingUrl } from "@reloop/be-mail/lib/crypto";
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
			if (originalUrl.includes(`${baseUrl}/track/click/`)) {
				return match;
			}

			const encodedUrl = encodeURIComponent(originalUrl);
			const sig = signTrackingUrl(originalUrl, mailConfig.TRACKING_SECRET);
			const trackingUrl = `${baseUrl}/track/click/${emailLogId}?url=${encodedUrl}&sig=${sig}`;

			return `${prefix}${quote}${trackingUrl}${quote}`;
		},
	);
}

function injectOpenPixel(
	html: string,
	emailLogId: string,
	baseUrl: string,
): string {
	const sig = signTrackingUrl(emailLogId, mailConfig.TRACKING_SECRET);
	const pixelUrl = `${baseUrl}/track/open/${emailLogId}?sig=${sig}`;
	const pixel = `<img src="${pixelUrl}" width="1" height="1" alt="" style="display:none;border:0;" />`;

	const bodyCloseIndex = html.lastIndexOf("</body>");
	if (bodyCloseIndex !== -1) {
		return html.slice(0, bodyCloseIndex) + pixel + html.slice(bodyCloseIndex);
	}

	return html + pixel;
}
