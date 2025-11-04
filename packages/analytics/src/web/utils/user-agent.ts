const FACEBOOK = "Facebook";
const MOBILE = "Mobile";
const IOS = "iOS";
const ANDROID = "Android";
const TABLET = "Tablet";
const ANDROID_TABLET = ANDROID + " " + TABLET;
const IPAD = "iPad";
const APPLE = "Apple";
const APPLE_WATCH = APPLE + " Watch";
const SAFARI = "Safari";
const BLACKBERRY = "BlackBerry";
const SAMSUNG = "Samsung";
const SAMSUNG_BROWSER = SAMSUNG + "Browser";
const SAMSUNG_INTERNET = SAMSUNG + " Internet";
const CHROME = "Chrome";
const CHROME_OS = CHROME + " OS";
const CHROME_IOS = CHROME + " " + IOS;
const INTERNET_EXPLORER = "Internet Explorer";
const INTERNET_EXPLORER_MOBILE = INTERNET_EXPLORER + " " + MOBILE;
const OPERA = "Opera";
const OPERA_MINI = OPERA + " Mini";
const EDGE = "Edge";
const MICROSOFT_EDGE = "Microsoft " + EDGE;
const FIREFOX = "Firefox";
const FIREFOX_IOS = FIREFOX + " " + IOS;
const NINTENDO = "Nintendo";
const PLAYSTATION = "PlayStation";
const XBOX = "Xbox";
const ANDROID_MOBILE = ANDROID + " " + MOBILE;
const MOBILE_SAFARI = MOBILE + " " + SAFARI;
const WINDOWS = "Windows";
const WINDOWS_PHONE = WINDOWS + " Phone";
const NOKIA = "Nokia";
const OUYA = "Ouya";
const GENERIC = "Generic";
const GENERIC_MOBILE = GENERIC + " " + MOBILE.toLowerCase();
const GENERIC_TABLET = GENERIC + " " + TABLET.toLowerCase();
const KONQUEROR = "Konqueror";

const BROWSER_VERSION_REGEX_SUFFIX = "(\\d+(\\.\\d+)?)";
const DEFAULT_BROWSER_VERSION_REGEX = new RegExp(
	"Version/" + BROWSER_VERSION_REGEX_SUFFIX,
);

const XBOX_REGEX = new RegExp(XBOX, "i");
const PLAYSTATION_REGEX = new RegExp(PLAYSTATION + " \\w+", "i");
const NINTENDO_REGEX = new RegExp(NINTENDO + " \\w+", "i");
const BLACKBERRY_REGEX = new RegExp(BLACKBERRY + "|PlayBook|BB10", "i");

const windowsVersionMap: Record<string, string> = {
	"NT3.51": "NT 3.11",
	"NT4.0": "NT 4.0",
	"5.0": "2000",
	"5.1": "XP",
	"5.2": "XP",
	"6.0": "Vista",
	"6.1": "7",
	"6.2": "8",
	"6.3": "8.1",
	"6.4": "10",
	"10.0": "10",
};

function isSafari(userAgent: string): boolean {
	return (
		userAgent.includes(SAFARI) &&
		!userAgent.includes(CHROME) &&
		!userAgent.includes(ANDROID)
	);
}

const safariCheck = (ua: string, vendor?: string) =>
	(vendor && vendor.includes(APPLE)) || isSafari(ua);

export function detectBrowser(
	userAgent: string,
	vendor: string | undefined,
): string {
	vendor = vendor || "";

	if (userAgent.includes(" OPR/") && userAgent.includes("Mini")) {
		return OPERA_MINI;
	}
	if (userAgent.includes(" OPR/")) {
		return OPERA;
	}
	if (BLACKBERRY_REGEX.test(userAgent)) {
		return BLACKBERRY;
	}
	if (userAgent.includes("IE" + MOBILE) || userAgent.includes("WPDesktop")) {
		return INTERNET_EXPLORER_MOBILE;
	}
	if (userAgent.includes(SAMSUNG_BROWSER)) {
		return SAMSUNG_INTERNET;
	}
	if (userAgent.includes(EDGE) || userAgent.includes("Edg/")) {
		return MICROSOFT_EDGE;
	}
	if (userAgent.includes("FBIOS")) {
		return FACEBOOK + " " + MOBILE;
	}
	if (userAgent.includes("UCWEB") || userAgent.includes("UCBrowser")) {
		return "UC Browser";
	}
	if (userAgent.includes("CriOS")) {
		return CHROME_IOS;
	}
	if (userAgent.includes("CrMo")) {
		return CHROME;
	}
	if (userAgent.includes(ANDROID) && userAgent.includes(SAFARI)) {
		return ANDROID_MOBILE;
	}
	if (userAgent.includes(CHROME)) {
		return CHROME;
	}
	if (userAgent.includes("FxiOS")) {
		return FIREFOX_IOS;
	}
	if (userAgent.toLowerCase().includes(KONQUEROR.toLowerCase())) {
		return KONQUEROR;
	}
	if (safariCheck(userAgent, vendor)) {
		return userAgent.includes(MOBILE) ? MOBILE_SAFARI : SAFARI;
	}
	if (userAgent.includes(FIREFOX)) {
		return FIREFOX;
	}
	if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
		return INTERNET_EXPLORER;
	}
	if (userAgent.includes("Gecko")) {
		return FIREFOX;
	}

	return "";
}

const versionRegexes: Record<string, RegExp[]> = {
	[INTERNET_EXPLORER_MOBILE]: [
		new RegExp("rv:" + BROWSER_VERSION_REGEX_SUFFIX),
	],
	[MICROSOFT_EDGE]: [new RegExp(EDGE + "?\\/" + BROWSER_VERSION_REGEX_SUFFIX)],
	[CHROME]: [
		new RegExp("(" + CHROME + "|CrMo)\\/" + BROWSER_VERSION_REGEX_SUFFIX),
	],
	[CHROME_IOS]: [new RegExp("CriOS\\/" + BROWSER_VERSION_REGEX_SUFFIX)],
	"UC Browser": [
		new RegExp("(UCBrowser|UCWEB)\\/" + BROWSER_VERSION_REGEX_SUFFIX),
	],
	[SAFARI]: [DEFAULT_BROWSER_VERSION_REGEX],
	[MOBILE_SAFARI]: [DEFAULT_BROWSER_VERSION_REGEX],
	[OPERA]: [
		new RegExp("(" + OPERA + "|OPR)\\/" + BROWSER_VERSION_REGEX_SUFFIX),
	],
	[FIREFOX]: [new RegExp(FIREFOX + "\\/" + BROWSER_VERSION_REGEX_SUFFIX)],
	[FIREFOX_IOS]: [new RegExp("FxiOS\\/" + BROWSER_VERSION_REGEX_SUFFIX)],
	[KONQUEROR]: [
		new RegExp("Konqueror[:/]?" + BROWSER_VERSION_REGEX_SUFFIX, "i"),
	],
	[BLACKBERRY]: [
		new RegExp(BLACKBERRY + " " + BROWSER_VERSION_REGEX_SUFFIX),
		DEFAULT_BROWSER_VERSION_REGEX,
	],
	[ANDROID_MOBILE]: [
		new RegExp("android\\s" + BROWSER_VERSION_REGEX_SUFFIX, "i"),
	],
	[SAMSUNG_INTERNET]: [
		new RegExp(SAMSUNG_BROWSER + "\\/" + BROWSER_VERSION_REGEX_SUFFIX),
	],
	[INTERNET_EXPLORER]: [
		new RegExp("(rv:|MSIE )" + BROWSER_VERSION_REGEX_SUFFIX),
	],
	Mozilla: [new RegExp("rv:" + BROWSER_VERSION_REGEX_SUFFIX)],
};

export function detectBrowserVersion(
	userAgent: string,
	vendor: string | undefined,
): number | null {
	const browser = detectBrowser(userAgent, vendor);
	const regexes: RegExp[] | undefined =
		versionRegexes[browser as keyof typeof versionRegexes];

	if (!regexes) {
		return null;
	}

	for (let i = 0; i < regexes.length; i++) {
		const regex = regexes[i];
		const matches = regex ? userAgent.match(regex) : null;
		if (matches) {
			return Number.parseFloat(matches[matches.length - 2] || "0");
		}
	}

	return null;
}

const osMatchers: [
	RegExp,
	(
		| [string, string]
		| ((match: RegExpMatchArray | null, userAgent: string) => [string, string])
	),
][] = [
	[
		new RegExp(XBOX + "; " + XBOX + " (.*?)[);]", "i"),
		(match) => {
			return [XBOX, (match && match[1]) || ""];
		},
	],
	[new RegExp(NINTENDO, "i"), [NINTENDO, ""]],
	[new RegExp(PLAYSTATION, "i"), [PLAYSTATION, ""]],
	[BLACKBERRY_REGEX, [BLACKBERRY, ""]],
	[
		new RegExp(WINDOWS, "i"),
		(_, userAgent) => {
			if (/Phone/.test(userAgent) || /WPDesktop/.test(userAgent)) {
				return [WINDOWS_PHONE, ""];
			}

			if (new RegExp(MOBILE).test(userAgent) && !/IEMobile\b/.test(userAgent)) {
				return [WINDOWS + " " + MOBILE, ""];
			}

			const match = /Windows NT ([0-9.]+)/i.exec(userAgent);
			if (match && match[1]) {
				const version = match[1];
				let osVersion = windowsVersionMap[version] || "";

				if (/arm/i.test(userAgent)) {
					osVersion = "RT";
				}

				return [WINDOWS, osVersion];
			}

			return [WINDOWS, ""];
		},
	],
	[
		/((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/,
		(match) => {
			if (match && match[3]) {
				const versionParts = [match[3], match[4], match[5] || "0"];
				return [IOS, versionParts.join(".")];
			}
			return [IOS, ""];
		},
	],
	[
		/(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i,
		(match) => {
			let version = "";
			if (match && match.length >= 3) {
				version = !match[2] ? match[3] || "" : match[2] || "";
			}
			return ["watchOS", version];
		},
	],
	[
		new RegExp(
			"(" + ANDROID + " (\\d+)\\.(\\d+)\\.?(\\d+)?|" + ANDROID + ")",
			"i",
		),
		(match) => {
			if (match && match[2]) {
				const versionParts = [match[2], match[3], match[4] || "0"];
				return [ANDROID, versionParts.join(".")];
			}
			return [ANDROID, ""];
		},
	],
	[
		/Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i,
		(match) => {
			const result: [string, string] = ["Mac OS X", ""];
			if (match && match[1]) {
				const versionParts = [match[1], match[2], match[3] || "0"];
				result[1] = versionParts.join(".");
			}
			return result;
		},
	],
	[/Mac/i, ["Mac OS X", ""]],
	[/CrOS/, [CHROME_OS, ""]],
	[/Linux|debian/i, ["Linux", ""]],
];

export function detectOS(userAgent: string): [string, string] {
	for (let i = 0; i < osMatchers.length; i++) {
		const [regex, resultOrFn] = osMatchers[i] || [/(?:)/, () => ["", ""]];
		const match = regex ? regex.exec(userAgent) : null;

		const result =
			match &&
			(typeof resultOrFn === "function"
				? resultOrFn(match, userAgent)
				: resultOrFn);

		if (result) {
			return result;
		}
	}

	return ["", ""];
}

export function detectDevice(userAgent: string): string {
	if (NINTENDO_REGEX.test(userAgent)) {
		return NINTENDO;
	}
	if (PLAYSTATION_REGEX.test(userAgent)) {
		return PLAYSTATION;
	}
	if (XBOX_REGEX.test(userAgent)) {
		return XBOX;
	}
	if (new RegExp(OUYA, "i").test(userAgent)) {
		return OUYA;
	}
	if (new RegExp("(" + WINDOWS_PHONE + "|WPDesktop)", "i").test(userAgent)) {
		return WINDOWS_PHONE;
	}
	if (/iPad/.test(userAgent)) {
		return IPAD;
	}
	if (/iPod/.test(userAgent)) {
		return "iPod Touch";
	}
	if (/iPhone/.test(userAgent)) {
		return "iPhone";
	}
	if (/(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i.test(userAgent)) {
		return APPLE_WATCH;
	}
	if (BLACKBERRY_REGEX.test(userAgent)) {
		return BLACKBERRY;
	}
	if (/(kobo)\s(ereader|touch)/i.test(userAgent)) {
		return "Kobo";
	}
	if (new RegExp(NOKIA, "i").test(userAgent)) {
		return NOKIA;
	}
	if (
		/(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(userAgent) ||
		/(kf[a-z]+)( bui|\)).+silk\//i.test(userAgent)
	) {
		return "Kindle Fire";
	}
	if (/(Android|ZTE)/i.test(userAgent)) {
		if (
			!new RegExp(MOBILE).test(userAgent) ||
			/(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(
				userAgent,
			)
		) {
			if (
				(/pixel[\daxl ]{1,6}/i.test(userAgent) &&
					!/pixel c/i.test(userAgent)) ||
				/(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(userAgent) ||
				(/lmy47v/i.test(userAgent) && !/QTAQZ3/i.test(userAgent))
			) {
				return ANDROID;
			}
			return ANDROID_TABLET;
		}
		return ANDROID;
	}
	if (new RegExp("(pda|" + MOBILE + ")", "i").test(userAgent)) {
		return GENERIC_MOBILE;
	}
	if (
		new RegExp(TABLET, "i").test(userAgent) &&
		!new RegExp(TABLET + " pc", "i").test(userAgent)
	) {
		return GENERIC_TABLET;
	}
	return "";
}

export function detectDeviceType(userAgent: string): string {
	const device = detectDevice(userAgent);

	if (
		device === IPAD ||
		device === ANDROID_TABLET ||
		device === "Kobo" ||
		device === "Kindle Fire" ||
		device === GENERIC_TABLET
	) {
		return TABLET;
	}
	if (
		device === NINTENDO ||
		device === XBOX ||
		device === PLAYSTATION ||
		device === OUYA
	) {
		return "Console";
	}
	if (device === APPLE_WATCH) {
		return "Wearable";
	}
	if (device) {
		return MOBILE;
	}
	return "Desktop";
}

export function browserLanguage(): string {
	return (
		globalThis.navigator?.language ||
		(globalThis.navigator as any)?.userLanguage ||
		""
	);
}
