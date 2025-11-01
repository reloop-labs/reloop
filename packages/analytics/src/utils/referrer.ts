import { document } from "./global.js";

const URL_REGEX_PREFIX = "https?://(.*)";

export function convertToURL(url: string): HTMLAnchorElement | null {
	if (!document) return null;

	const location = document.createElement("a");
	location.href = url;
	return location;
}

export function getQueryParam(url: string, param: string): string {
	try {
		const uri = new URL(url);
		return uri.searchParams.get(param) || "";
	} catch {
		return "";
	}
}

export function searchEngine(): string | null {
	if (!document?.referrer) return null;

	const referrer = document.referrer;

	if (referrer.search(URL_REGEX_PREFIX + "google.([^/?]*)") === 0) {
		return "google";
	}
	if (referrer.search(URL_REGEX_PREFIX + "bing.com") === 0) {
		return "bing";
	}
	if (referrer.search(URL_REGEX_PREFIX + "yahoo.com") === 0) {
		return "yahoo";
	}
	if (referrer.search(URL_REGEX_PREFIX + "duckduckgo.com") === 0) {
		return "duckduckgo";
	}

	return null;
}

export function searchInfo(): Record<string, string> {
	const search = searchEngine();
	const param = search !== "yahoo" ? "q" : "p";
	const ret: Record<string, string> = {};

	if (search && document?.referrer) {
		ret["$search_engine"] = search;
		const keyword = getQueryParam(document.referrer, param);
		if (keyword.length) {
			ret["ph_keyword"] = keyword;
		}
	}

	return ret;
}

export function referrer(): string {
	return document?.referrer || "$direct";
}

export function referringDomain(): string {
	if (!document?.referrer) return "$direct";

	const url = convertToURL(document.referrer);
	return url?.host || "$direct";
}

export function referrerInfo(): Record<string, string> {
	return {
		$referrer: referrer(),
		$referring_domain: referringDomain(),
	};
}
