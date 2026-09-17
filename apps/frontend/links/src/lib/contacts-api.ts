/**
 * Upstream contacts service base for Next.js unsubscribe *proxies*.
 *
 * Custom tracking hosts hit this app; the API routes forward to the real
 * contacts service so the List-Unsubscribe domain matches the sender's
 * tracking domain. Prefer INTERNAL_API_URL in deploy
 * (e.g. http://contacts:8014/api/contacts).
 */
export function getContactsApiBaseUrl(): string {
	const internal = process.env.INTERNAL_API_URL?.replace(/\/+$/, "");
	if (internal) return internal;

	const publicContacts = process.env.PUBLIC_CONTACTS_API_URL?.replace(
		/\/+$/,
		"",
	);
	if (publicContacts) return publicContacts;

	if (process.env.NODE_ENV === "production") {
		return "https://reloop.sh/api/contacts";
	}

	return "http://localhost:8014/api/contacts";
}

/** Upstream contacts URL used only inside the Next API proxy routes. */
export function getContactsOneClickUrl(token: string): string {
	return `${getContactsApiBaseUrl()}/v1/preferences/one-click/${encodeURIComponent(token)}`;
}

export function getContactsPreferencesUrl(path: string): string {
	return `${getContactsApiBaseUrl()}/v1/preferences/${path.replace(/^\/+/, "")}`;
}
