import { getSiteUrl } from "@reloop/links/lib/site";

/**
 * Upstream mail service base for Next.js tracking *proxies*.
 *
 * Custom hosts hit this app; the API routes forward to the real mail service.
 * Prefer INTERNAL_MAIL_API_URL in deploy (e.g. http://mail:8015/api/mail).
 */
export function getMailApiBaseUrl(): string {
	const internal = process.env.INTERNAL_MAIL_API_URL?.replace(/\/+$/, "");
	if (internal) return internal;

	const publicMail = process.env.PUBLIC_MAIL_API_URL?.replace(/\/+$/, "");
	if (publicMail) return publicMail;

	if (process.env.NODE_ENV === "production") {
		return "https://reloop.sh/api/mail";
	}

	return "http://localhost:8015/api/mail";
}

/** Public tracking paths on this app (via NEXT_PUBLIC_URL). */
export function getPublicTrackClickUrl(token: string): string {
	return `${getSiteUrl()}/api/mail/v1/track/click/${encodeURIComponent(token)}`;
}

export function getPublicTrackOpenUrl(token: string): string {
	return `${getSiteUrl()}/api/mail/v1/track/open/${encodeURIComponent(token)}`;
}

/** Upstream mail URLs used only inside the Next API proxy routes. */
export function getMailTrackClickUrl(token: string): string {
	return `${getMailApiBaseUrl()}/v1/track/click/${encodeURIComponent(token)}`;
}

export function getMailTrackOpenUrl(token: string): string {
	return `${getMailApiBaseUrl()}/v1/track/open/${encodeURIComponent(token)}`;
}

/** Best-effort destination from a tracking token when the mail API is down. */
export function decodeDestinationFromToken(token: string): string | null {
	try {
		const json = Buffer.from(token, "base64url").toString("utf-8");
		const payload = JSON.parse(json) as { url?: string };
		return payload.url ?? null;
	} catch {
		return null;
	}
}

/**
 * Record a click through this app's public Next API
 * (`NEXT_PUBLIC_URL/api/mail/v1/track/click/...`), which proxies to mail.
 */
export async function resolveClickDestination(
	token: string,
): Promise<string | null> {
	let destination = decodeDestinationFromToken(token);

	try {
		const res = await fetch(getPublicTrackClickUrl(token), {
			method: "GET",
			redirect: "manual",
			cache: "no-store",
			headers: {
				"User-Agent": "ReloopLinks/1.0",
				Accept: "text/html,application/xhtml+xml,*/*",
			},
		});

		const isRedirect = res.status >= 300 && res.status < 400;
		if (res.ok || isRedirect) {
			const location = res.headers.get("location");
			if (location) {
				destination = location;
			}
		}
	} catch {
		// Fall through to token-decoded destination.
	}

	return destination;
}
