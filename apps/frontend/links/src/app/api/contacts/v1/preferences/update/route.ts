import { proxyContactsPreferencePost } from "@reloop/links/lib/proxy-contacts-json";

export async function POST(request: Request) {
	return proxyContactsPreferencePost(request, "update");
}
