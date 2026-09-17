import { campaignsConfig } from "@be/campaigns/campaigns.config";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

/**
 * Per-recipient unsubscribe URLs for campaign sends.
 *
 * Tokens reuse the contacts preferences scheme (HMAC-SHA256 over a
 * `{contactId, organizationId, expiresAt}` payload) so the contacts service
 * can verify them without any extra lookup. The campaigns service signs with
 * the shared `PREFERENCES_SECRET`.
 */

const TOKEN_EXPIRY_DAYS = 30;

function base64UrlEncode(data: Uint8Array): string {
	return Buffer.from(data)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

async function getKey(secret: string): Promise<CryptoKey> {
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return keyMaterial;
}

export async function signPreferencesToken(params: {
	contactId: string;
	organizationId: string;
}): Promise<string> {
	const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
	const payloadStr = JSON.stringify({ ...params, expiresAt });
	const encodedPayload = base64UrlEncode(new TextEncoder().encode(payloadStr));

	const key = await getKey(campaignsConfig.PREFERENCES_SECRET);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(encodedPayload),
	);
	return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function fallbackBaseUrl(): string {
	return campaignsConfig.TRACKING_BASE_URL.replace(/\/$/, "");
}

function trackingProtocol(): string {
	return campaignsConfig.BASE_URL.startsWith("https://")
		? "https://"
		: "http://";
}

export function extractSenderDomain(from: string): string | null {
	const mailbox = extractSenderMailbox(from);
	const domain = mailbox?.split("@")[1]?.trim().toLowerCase();
	return domain || null;
}

export function extractSenderMailbox(from: string): string | null {
	const match = from.match(/<([^>]+)>/)?.[1] ?? from;
	const email = match.trim().toLowerCase();
	return email.includes("@") ? email : null;
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
	const headers: Record<string, string> = {};
	const listParts: string[] = [];
	if (params.oneClickUrl) {
		listParts.push(`<${params.oneClickUrl}>`);
	}
	const mailbox =
		extractSenderMailbox(params.replyTo ?? "") ??
		extractSenderMailbox(params.from);
	if (mailbox) {
		listParts.push(`<mailto:${mailbox}?subject=unsubscribe>`);
	}
	if (listParts.length > 0) {
		headers["List-Unsubscribe"] = listParts.join(", ");
	}
	if (params.oneClickUrl) {
		headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
	}
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
export async function resolveUnsubscribeBase(params: {
	organizationId: string;
	from: string;
}): Promise<string> {
	const domainName = extractSenderDomain(params.from);
	if (!domainName) return fallbackBaseUrl();

	const record = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.organizationId, params.organizationId),
			eq(schema.domain.domain, domainName),
			isNull(schema.domain.deletedAt),
		),
	});

	if (
		record?.systemVerified &&
		record.status === "active" &&
		record.isTrackingDomain &&
		record.trackingSubdomain &&
		(record.isClickTrackingEnabled || record.isOpenTrackingEnabled)
	) {
		return `${trackingProtocol()}${record.trackingSubdomain}.${record.domain}`;
	}

	return fallbackBaseUrl();
}

export function preferencesPageUrl(token: string, base?: string): string {
	return `${(base ?? fallbackBaseUrl()).replace(/\/$/, "")}/preferences/${token}`;
}

/** Campaign unsubscribe link — main-list only, no channel preference UI. */
export function unsubscribePageUrl(token: string, base?: string): string {
	return `${(base ?? fallbackBaseUrl()).replace(/\/$/, "")}/preferences/unsubscribe/${token}`;
}

export function oneClickUnsubscribeUrl(token: string, base?: string): string {
	return `${(base ?? fallbackBaseUrl()).replace(/\/$/, "")}/api/contacts/v1/preferences/one-click/${token}`;
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
