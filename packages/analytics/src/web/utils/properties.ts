import { campaignParams } from "./campaign.js";
import { location, navigator, userAgent } from "./global.js";
import { referrerInfo, searchInfo } from "./referrer.js";
import type { Properties } from "./types.js";
import {
	browserLanguage,
	detectBrowser,
	detectBrowserVersion,
	detectDeviceType,
	detectOS,
} from "./user-agent.js";

function timestamp(): number {
	return Date.now();
}

export function getProperties(): Properties {
	if (!userAgent) {
		return {};
	}

	const [osName, osVersion] = detectOS(userAgent);
	const browser = detectBrowser(userAgent, navigator?.vendor);
	const browserVersion = detectBrowserVersion(userAgent, navigator?.vendor);
	const deviceType = detectDeviceType(userAgent);
	const campaign = campaignParams();
	const referrer = referrerInfo();
	const search = searchInfo();

	const properties: Properties = {
		$os: osName,
		$os_version: osVersion,
		$browser: browser,
		$device_type: deviceType,
		$current_url: location?.href || "",
		$host: location?.host || "",
		$pathname: location?.pathname || "",
		$raw_user_agent:
			userAgent.length > 1000 ? userAgent.substring(0, 997) + "..." : userAgent,
		$browser_version: browserVersion || "",
		$browser_language: browserLanguage(),
		$screen_height: (globalThis as any)?.screen?.height || 0,
		$screen_width: (globalThis as any)?.screen?.width || 0,
		$viewport_height: (globalThis as any)?.innerHeight || 0,
		$viewport_width: (globalThis as any)?.innerWidth || 0,
		$lib: "web",
		$timestamp: timestamp() / 1000,
		...campaign,
		...referrer,
		...search,
	};

	return properties;
}
