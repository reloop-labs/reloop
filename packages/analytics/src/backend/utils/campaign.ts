export const CAMPAIGN_PARAMS = [
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
	"gclid",
	"gad_source",
	"gclsrc",
	"dclid",
	"gbraid",
	"wbraid",
	"fbclid",
	"msclkid",
	"twclid",
	"li_fat_id",
	"mc_cid",
	"igshid",
	"ttclid",
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
	url?: string,
	customParams?: string[],
): Record<string, string> {
	const campaignKeywords = CAMPAIGN_PARAMS.concat(customParams || []);
	const params: Record<string, string> = {};

	if (!url) return params;

	campaignKeywords.forEach((key) => {
		const value = getQueryParam(url, key);
		if (value.length) {
			params[key] = value;
		}
	});

	return params;
}

