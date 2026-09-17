import { getContactsPreferencesUrl } from "@reloop/links/lib/contacts-api";

/**
 * Server-only: POST main-list unsubscribe to the contacts service.
 * Browser traffic stays on `/preferences/unsubscribe/:token`.
 */
export async function postMainListUnsubscribe(token: string): Promise<boolean> {
	try {
		const res = await fetch(getContactsPreferencesUrl("unsubscribe"), {
			method: "POST",
			cache: "no-store",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		});
		return res.ok;
	} catch {
		return false;
	}
}
