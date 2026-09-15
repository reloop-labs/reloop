import { getContactsApiBaseUrl } from "@reloop/links/lib/contacts-api";

export interface ChannelData {
	id: string;
	name: string;
	description: string | null;
	defaultSubscription: "opt_in" | "opt_out";
	status: "enrolled" | "unenrolled" | "none";
}

export interface PreferencesData {
	contact: {
		email: string;
		firstName: string | null;
		lastName: string | null;
		status?: string;
	};
	organization: {
		name: string;
	};
	channels: ChannelData[];
}

export async function fetchPreferencesData(
	token: string,
): Promise<PreferencesData | null> {
	try {
		const url = `${getContactsApiBaseUrl()}/v1/preferences/data?token=${encodeURIComponent(token)}`;
		const res = await fetch(url, { cache: "no-store" });
		if (!res.ok) return null;
		return res.json();
	} catch {
		return null;
	}
}
