/**
 * unsubscribe.ts
 *
 * Per-recipient unsubscribe links, shared by every send path (mail API,
 * campaigns, automations) so `{{{unsubscribe_url}}}` works the same way
 * whichever one sends the email.
 *
 * Tokens follow the contacts preferences scheme (HMAC-SHA256 over a
 * `{contactId, organizationId, expiresAt}` payload) so the contacts service
 * verifies them without a lookup. Callers pass the shared
 * `PREFERENCES_SECRET`; it must match the contacts service.
 */

import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";

const TOKEN_EXPIRY_DAYS = 30;

function base64UrlEncode(data: Uint8Array): string {
	return Buffer.from(data)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

export async function signPreferencesToken(
	params: { contactId: string; organizationId: string },
	secret: string,
): Promise<string> {
	const expiresAt = Date.now() + TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
	const payloadStr = JSON.stringify({ ...params, expiresAt });
	const encodedPayload = base64UrlEncode(new TextEncoder().encode(payloadStr));

	const key = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const signature = await crypto.subtle.sign(
		"HMAC",
		key,
		new TextEncoder().encode(encodedPayload),
	);
	return `${encodedPayload}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export function extractSenderMailbox(from: string): string | null {
	const match = from.match(/<([^>]+)>/)?.[1] ?? from;
	const email = match.trim().toLowerCase();
	return email.includes("@") ? email : null;
}

export function extractSenderDomain(from: string): string | null {
	const mailbox = extractSenderMailbox(from);
	const domain = mailbox?.split("@")[1]?.trim().toLowerCase();
	return domain || null;
}

/**
 * Public base for unsubscribe URLs: the sender's custom tracking domain when
 * it is verified and tracking is on (so the link matches the sender family),
 * else `fallbackBase` (the Reloop links host).
 */
export async function resolveUnsubscribeBase(params: {
	organizationId: string;
	from: string;
	fallbackBase: string;
	/** "https://" or "http://", used for the tracking domain. */
	protocol: string;
}): Promise<string> {
	const fallback = params.fallbackBase.replace(/\/$/, "");
	const domainName = extractSenderDomain(params.from);
	if (!domainName) return fallback;

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
		return `${params.protocol}${record.trackingSubdomain}.${record.domain}`;
	}

	return fallback;
}

export function preferencesPageUrl(token: string, base: string): string {
	return `${base.replace(/\/$/, "")}/preferences/${token}`;
}

/** Unsubscribe page: main list only, no channel preference UI. */
export function unsubscribePageUrl(token: string, base: string): string {
	return `${base.replace(/\/$/, "")}/preferences/unsubscribe/${token}`;
}

/** RFC 8058 one-click endpoint mailbox providers POST to. */
export function oneClickUnsubscribeUrl(token: string, base: string): string {
	return `${base.replace(/\/$/, "")}/api/contacts/v1/preferences/one-click/${token}`;
}

/**
 * Unsubscribe link for a recipient who is not a contact: there is no list to
 * remove them from, so it asks the sender by email instead.
 */
export function mailtoUnsubscribeUrl(params: {
	from: string;
	replyTo?: string | null;
}): string | null {
	const mailbox =
		extractSenderMailbox(params.replyTo ?? "") ??
		extractSenderMailbox(params.from);
	return mailbox ? `mailto:${mailbox}?subject=unsubscribe` : null;
}

/**
 * RFC 2369 / RFC 8058 headers. Gmail and Yahoo only offer their one-click
 * button when both are present, HTTPS, and covered by DKIM.
 */
export function listUnsubscribeHeaders(params: {
	oneClickUrl: string | null;
	from: string;
	replyTo?: string | null;
}): Record<string, string> {
	const headers: Record<string, string> = {};
	const listParts: string[] = [];
	if (params.oneClickUrl) listParts.push(`<${params.oneClickUrl}>`);
	const mailto = mailtoUnsubscribeUrl(params);
	if (mailto) listParts.push(`<${mailto}>`);
	if (listParts.length > 0) headers["List-Unsubscribe"] = listParts.join(", ");
	if (params.oneClickUrl) {
		headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
	}
	return headers;
}
