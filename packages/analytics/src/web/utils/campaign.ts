import { document } from "./global.js";

export const CAMPAIGN_PARAMS = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
	"gclid", // google ads
	"gad_source", // google ads
	"gclsrc", // google ads 360
	"dclid", // google display ads
	"gbraid", // google ads, web to app
	"wbraid", // google ads, app to web
	"fbclid", // facebook
	"msclkid", // microsoft
	"twclid", // twitter
	"li_fat_id", // linkedin
	"mc_cid", // mailchimp campaign id
	"igshid", // instagram
	"ttclid", // tiktok
];

export function getQueryParam(url: string, param: string): string {
	try {
		const uri = new URL(url);
		return uri.searchParams.get(param) || "";
	} catch {
		return "";
	}
}

export function campaignParams(
	customParams?: string[],
): Record<string, string> {
	const campaignKeywords = CAMPAIGN_PARAMS.concat(customParams || []);
	const params: Record<string, string> = {};

	if (!document) return params;

	campaignKeywords.forEach((key) => {
		const value = getQueryParam(document?.URL || "", key);
		if (value.length) {
			params[key] = value;
		}
	});

	return params;
}
