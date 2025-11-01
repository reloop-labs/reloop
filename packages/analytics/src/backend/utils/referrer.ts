import type { Properties } from "../types.js";

const URL_REGEX_PREFIX = "https?://(.*)";

export function getQueryParam(url: string, param: string): string {
	try {
		const uri = new URL(url);
		return uri.searchParams.get(param) || "";
	} catch {
		return "";
	}
}

export function searchEngine(referrer?: string): string | null {
	if (!referrer) return null;

	if (referrer.search(URL_REGEX_PREFIX + "google.([^/?]*)") === 0) {
		return "google";
	} else if (referrer.search(URL_REGEX_PREFIX + "bing.com") === 0) {
		return "bing";
	} else if (referrer.search(URL_REGEX_PREFIX + "yahoo.com") === 0) {
		return "yahoo";
	} else if (
		referrer.search(URL_REGEX_PREFIX + "duckduckgo.com") === 0
	) {
		return "duckduckgo";
	}

	return null;
}

export function searchInfo(referrer?: string): Record<string, string> {
	const search = searchEngine(referrer);
	const param = search !== "yahoo" ? "q" : "p";
	const ret: Record<string, string> = {};

	if (search && referrer) {
		ret["$search_engine"] = search;
		const keyword = getQueryParam(referrer, param);
		if (keyword.length) {
			ret["ph_keyword"] = keyword;
		}
	}

	return ret;
}

export function getReferrerInfo(
	referrerHeader?: string,
	currentUrl?: string,
): Record<string, string> {
	const referrer = referrerHeader || "$direct";
	let referringDomain = "$direct";

	if (referrer && referrer !== "$direct") {
		try {
			const url = new URL(referrer);
			referringDomain = url.host;
		} catch {
			// Invalid URL, keep as $direct
		}
	}

	return {
		$referrer: referrer,
		$referring_domain: referringDomain,
	};
}

