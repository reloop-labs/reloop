import {
	detectBrowser,
	detectBrowserVersion,
	detectDeviceType,
	detectOS,
} from "../../utils/user-agent.js";
import type { Properties } from "../types.js";
import { campaignParams } from "./campaign.js";
import { getReferrerInfo, searchInfo } from "./referrer.js";
export interface RequestContext {
	url?: string;
	userAgent?: string;
	referer?: string;
	vendor?: string;
	screenWidth?: number;
	screenHeight?: number;
	viewportWidth?: number;
	viewportHeight?: number;
}

function timestamp(): number {
	return Date.now();
}

export function getProperties(context?: RequestContext): Properties {
	const ua = context?.userAgent || "";
	const url = context?.url || "";
	const referer = context?.referer || "";

	if (!ua) {
		return {
			$lib: "node",
			$timestamp: timestamp() / 1000,
		};
	}

	const [osName, osVersion] = detectOS(ua);
	const browser = detectBrowser(ua, context?.vendor);
	const browserVersion = detectBrowserVersion(ua, context?.vendor);
	const deviceType = detectDeviceType(ua);
	const campaign = campaignParams(url);
	const referrer = getReferrerInfo(referer, url);
	const search = searchInfo(referer);

	let host = "";
	let pathname = "";
	try {
		if (url) {
			const urlObj = new URL(url);
			host = urlObj.host;
			pathname = urlObj.pathname;
		}
	} catch {
		// Invalid URL, leave empty
	}

	const properties: Properties = {
		$os: osName,
		$os_version: osVersion,
		$browser: browser,
		$device_type: deviceType,
		$current_url: url,
		$host: host,
		$pathname: pathname,
		$raw_user_agent: ua.length > 1000 ? ua.substring(0, 997) + "..." : ua,
		$browser_version: browserVersion || "",
		$screen_height: context?.screenHeight || 0,
		$screen_width: context?.screenWidth || 0,
		$viewport_height: context?.viewportHeight || 0,
		$viewport_width: context?.viewportWidth || 0,
		$lib: "node",
		$timestamp: timestamp() / 1000,
		...campaign,
		...referrer,
		...search,
	};

	return properties;
}
