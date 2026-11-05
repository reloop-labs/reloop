import { campaignsConfig } from "@be/campaigns/campaigns.config";
import {
	extractSenderDomain,
	extractSenderMailbox,
	listUnsubscribeHeaders,
	oneClickUnsubscribeUrl as sharedOneClickUrl,
	preferencesPageUrl as sharedPreferencesPageUrl,
	resolveUnsubscribeBase as sharedResolveUnsubscribeBase,
	signPreferencesToken as sharedSignPreferencesToken,
	unsubscribePageUrl as sharedUnsubscribePageUrl,
} from "@reloop/db/unsubscribe";

export { extractSenderDomain, extractSenderMailbox };

/**
 * Per-recipient unsubscribe URLs for campaign sends. The logic lives in
 * `@reloop/db/unsubscribe` so the mail API fills `{{{unsubscribe_url}}}` the
 * same way; these bind it to the campaigns config.
 */

export function signPreferencesToken(params: {
	contactId: string;
	organizationId: string;
}): Promise<string> {
	return sharedSignPreferencesToken(params, campaignsConfig.PREFERENCES_SECRET);
}

function fallbackBaseUrl(): string {
	return campaignsConfig.TRACKING_BASE_URL.replace(/\/$/, "");
}

function trackingProtocol(): string {
	return campaignsConfig.BASE_URL.startsWith("https://")
		? "https://"
		: "http://";
}

/**
 * RFC 8058 / RFC 2369 headers for campaign mail.
 * Gmail only offers one-click if List-Unsubscribe and List-Unsubscribe-Post
 * are present, HTTPS, and covered by DKIM.
 */
export function campaignListHeaders(params: {
	oneClickUrl: string | null;
	from: string;
	replyTo?: string | null;
	campaignId: string;
}): Record<string, string> {
	const headers = listUnsubscribeHeaders(params);
	const domain = extractSenderDomain(params.from);
	if (domain && params.campaignId) {
		headers["List-Id"] = `<${params.campaignId}.campaigns.${domain}>`;
	}
	return headers;
}

/**
 * Resolve the public base for unsubscribe URLs for this send.
 *
 * Custom tracking domain when the sender domain is verified and has tracking
 * enabled (same predicate as the mail service) — so the List-Unsubscribe
 * domain matches the sender family. Otherwise falls back to the Reloop links
 * host, which proxies one-click unsubscribes to the contacts service.
 */
export function resolveUnsubscribeBase(params: {
	organizationId: string;
	from: string;
}): Promise<string> {
	return sharedResolveUnsubscribeBase({
		...params,
		fallbackBase: fallbackBaseUrl(),
		protocol: trackingProtocol(),
	});
}

export function preferencesPageUrl(token: string, base?: string): string {
	return sharedPreferencesPageUrl(token, base ?? fallbackBaseUrl());
}

/** Campaign unsubscribe link — main-list only, no channel preference UI. */
export function unsubscribePageUrl(token: string, base?: string): string {
	return sharedUnsubscribePageUrl(token, base ?? fallbackBaseUrl());
}

export function oneClickUnsubscribeUrl(token: string, base?: string): string {
	return sharedOneClickUrl(token, base ?? fallbackBaseUrl());
}

/** True when the html already carries its own unsubscribe affordance. */
export function hasUnsubscribeContent(html: string): boolean {
	const lower = html.toLowerCase();
	return (
		lower.includes("unsubscribe") ||
		lower.includes("unsubscribe_url") ||
		lower.includes("data-unsubscribe-link") ||
		lower.includes("/preferences/")
	);
}

/**
 * Totally unstyled footer appended only when the campaign has no unsubscribe
 * content of its own. Inherits the surrounding email styles.
 */
export function buildUnsubscribeFooter(unsubscribeUrl: string): string {
	return (
		`<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e5e7eb;` +
		`font-size:12px;line-height:1.6;color:#6b7280;text-align:center;">` +
		`<p style="margin:0 0 8px 0;">You received this email because you subscribed. ` +
		`<a href="${unsubscribeUrl}" data-unsubscribe-link="true" ` +
		`style="color:#6b7280;text-decoration:underline;">Unsubscribe</a> ` +
		"to stop receiving these emails.</p></div>"
	);
}

export function appendUnsubscribeFooter(
	html: string,
	unsubscribeUrl: string,
): string {
	if (!html || hasUnsubscribeContent(html)) return html;
	const footer = buildUnsubscribeFooter(unsubscribeUrl);
	const bodyClose = html.lastIndexOf("</body>");
	if (bodyClose !== -1) {
		return html.slice(0, bodyClose) + footer + html.slice(bodyClose);
	}
	return html + footer;
}
