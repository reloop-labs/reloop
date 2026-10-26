import { isIP } from "node:net";
import maxmind, { type CityResponse, type Reader } from "maxmind";
import { UAParser } from "ua-parser-js";

/**
 * What an open pixel or click request tells us about the reader, parsed for
 * display. The raw request (`rawRequest`) is stored next to it so these
 * fields can be re-derived later with better rules.
 *
 * Mail providers often fetch images themselves (Gmail, Yahoo, Apple Mail
 * Privacy Protection). Then the request describes the provider's proxy, not
 * the reader, so device and location are left empty and `proxied` is set.
 */
export type EngagementContext = {
	/** Email client or provider, e.g. "Gmail", "Apple Mail", "Outlook". */
	client: string | null;
	device: "desktop" | "mobile" | "tablet" | null;
	os: string | null;
	browser: string | null;
	/** ISO 3166-1 alpha-2, from a local GeoIP database when configured. */
	country: string | null;
	city: string | null;
	/** Fetched by the provider's image proxy; device and place are unknown. */
	proxied: boolean;
	/** Not a person: Apple's privacy prefetch or a security scanner. */
	machine: boolean;
	machineReason: "apple_privacy" | "security_scanner" | null;
};

type Classified = Omit<EngagementContext, "country" | "city">;

const SCANNER_PATTERN =
	/barracuda|mimecast|proofpoint|symantec|messagelabs|trendmicro|forcepoint|sophos|fortinet|zscaler|ironport|cisco|bitdefender|kaspersky|python-requests|python-urllib|curl\/|wget\/|go-http-client|okhttp|java\/|headlesschrome|phantomjs|\bbot\b|crawler|spider|scanner/i;

const EMPTY: Classified = {
	client: null,
	device: null,
	os: null,
	browser: null,
	proxied: false,
	machine: false,
	machineReason: null,
};

function deviceFromUa(ua: string): Pick<Classified, "device" | "os"> {
	const parsed = new UAParser(ua).getResult();
	const type = parsed.device.type;
	return {
		device:
			type === "mobile" || type === "tablet"
				? type
				: parsed.os.name
					? "desktop"
					: null,
		os: parsed.os.name ?? null,
	};
}

function scanner(): Classified {
	return { ...EMPTY, machine: true, machineReason: "security_scanner" };
}

/** Classify the request that loaded the open-tracking pixel. */
export function classifyOpen(userAgent: string | null): Classified {
	const ua = (userAgent ?? "").trim();
	if (!ua) return scanner();

	if (/GoogleImageProxy|ggpht\.com/i.test(ua)) {
		return { ...EMPTY, client: "Gmail", proxied: true };
	}
	if (/YahooMailProxy/i.test(ua)) {
		return { ...EMPTY, client: "Yahoo Mail", proxied: true };
	}
	// Apple Mail Privacy Protection prefetches every image through Apple's
	// proxies with a bare user agent, whether or not anyone reads the email.
	if (ua === "Mozilla/5.0") {
		return {
			...EMPTY,
			client: "Apple Mail",
			proxied: true,
			machine: true,
			machineReason: "apple_privacy",
		};
	}
	if (SCANNER_PATTERN.test(ua)) return scanner();

	if (/Microsoft Outlook|ms-office|MSOffice|Outlook-(iOS|Android)/i.test(ua)) {
		return { ...EMPTY, client: "Outlook", ...deviceFromUa(ua) };
	}
	if (/Thunderbird/i.test(ua)) {
		return { ...EMPTY, client: "Thunderbird", ...deviceFromUa(ua) };
	}
	// Apple Mail with privacy protection off: WebKit without a browser token.
	if (
		/AppleWebKit/.test(ua) &&
		/Macintosh|iPhone|iPad/.test(ua) &&
		!/Safari|Chrome|CriOS|FxiOS|Firefox|Edg/.test(ua)
	) {
		return { ...EMPTY, client: "Apple Mail", ...deviceFromUa(ua) };
	}

	const parsed = new UAParser(ua).getResult();
	return {
		...EMPTY,
		client: parsed.browser.name ? "Webmail" : null,
		browser: parsed.browser.name ?? null,
		...deviceFromUa(ua),
	};
}

/** Classify the request that followed a tracked link. */
export function classifyClick(userAgent: string | null): Classified {
	const ua = (userAgent ?? "").trim();
	if (!ua || SCANNER_PATTERN.test(ua)) return scanner();
	const parsed = new UAParser(ua).getResult();
	return {
		...EMPTY,
		browser: parsed.browser.name ?? null,
		...deviceFromUa(ua),
	};
}

/**
 * Client address behind Caddy. Caddy replaces X-Forwarded-For with the
 * connecting address unless the hop is a trusted proxy, so its first entry
 * is reliable; the socket address is the fallback without a proxy.
 */
export function clientIpFrom(
	headers: Headers,
	socketIp: string | null,
): string | null {
	const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
	if (forwarded && isIP(forwarded)) return forwarded;
	const realIp = headers.get("x-real-ip")?.trim();
	if (realIp && isIP(realIp)) return realIp;
	return socketIp && isIP(socketIp) ? socketIp : null;
}

/** Never persisted: a tracking request has no business carrying these. */
const CREDENTIAL_HEADERS = new Set([
	"cookie",
	"authorization",
	"proxy-authorization",
]);

/** The request as received, minus credentials, for storage on the event. */
export function rawRequest(
	headers: Headers,
	socketIp: string | null,
): { requestHeaders: Record<string, string>; clientIp: string | null } {
	const requestHeaders: Record<string, string> = {};
	headers.forEach((value, name) => {
		if (!CREDENTIAL_HEADERS.has(name.toLowerCase())) {
			requestHeaders[name.toLowerCase()] = value;
		}
	});
	return { requestHeaders, clientIp: clientIpFrom(headers, socketIp) };
}

let geoReader: Promise<Reader<CityResponse> | null> | null = null;

function openGeoReader(): Promise<Reader<CityResponse> | null> {
	const path = process.env.GEOIP_DB_PATH;
	if (!path) return Promise.resolve(null);
	geoReader ??= maxmind.open<CityResponse>(path).catch((error: unknown) => {
		console.error(`GeoIP database unavailable at ${path}:`, error);
		return null;
	});
	return geoReader;
}

/** Country and city from a local .mmdb (GeoLite2-City or DB-IP City Lite). */
export async function lookupGeo(
	ip: string | null,
): Promise<{ country: string | null; city: string | null }> {
	const none = { country: null, city: null };
	if (!ip) return none;
	const reader = await openGeoReader();
	if (!reader) return none;
	try {
		const hit = reader.get(ip);
		return {
			country: hit?.country?.iso_code ?? null,
			city: hit?.city?.names?.en ?? null,
		};
	} catch {
		return none;
	}
}

export async function engagementContext(args: {
	kind: "open" | "click";
	headers: Headers;
	socketIp: string | null;
}): Promise<EngagementContext> {
	const userAgent = args.headers.get("user-agent");
	const classified =
		args.kind === "open" ? classifyOpen(userAgent) : classifyClick(userAgent);
	// A proxy's or scanner's address says where Google, Apple or the
	// scanner is, not the reader.
	const geo =
		classified.proxied || classified.machine
			? { country: null, city: null }
			: await lookupGeo(clientIpFrom(args.headers, args.socketIp));
	return { ...classified, ...geo };
}
