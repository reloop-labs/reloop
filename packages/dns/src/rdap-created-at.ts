const IANA_RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 4000;

let ianaBootstrapCache: { loadedAt: number; map: Map<string, string> } | null =
	null;

export function parseRdapCreatedAt(body: unknown): Date | null {
	if (!body || typeof body !== "object") return null;
	const events = (body as { events?: unknown }).events;
	if (!Array.isArray(events)) return null;

	for (const event of events) {
		if (!event || typeof event !== "object") continue;
		const action = (event as { eventAction?: unknown }).eventAction;
		const date = (event as { eventDate?: unknown }).eventDate;
		if (action === "registration" && typeof date === "string" && date) {
			const parsed = new Date(date);
			if (!Number.isNaN(parsed.getTime())) return parsed;
		}
	}
	return null;
}

function joinRdapDomainUrl(base: string, domainName: string): string {
	const trimmed = base.replace(/\/+$/, "");
	if (/\/domain$/i.test(trimmed)) {
		return `${trimmed}/${encodeURIComponent(domainName)}`;
	}
	return `${trimmed}/domain/${encodeURIComponent(domainName)}`;
}

export function parseIanaRdapBootstrap(data: {
	services?: Array<[string[], string[]]>;
}): Map<string, string> {
	const map = new Map<string, string>();
	for (const service of data.services || []) {
		const [tlds, urls] = service;
		const base = urls?.[0];
		if (!base) continue;
		for (const tld of tlds || []) {
			map.set(tld.toLowerCase(), base);
		}
	}
	return map;
}

async function loadIanaRdapBootstrap(): Promise<Map<string, string>> {
	if (
		ianaBootstrapCache &&
		Date.now() - ianaBootstrapCache.loadedAt < BOOTSTRAP_TTL_MS
	) {
		return ianaBootstrapCache.map;
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000);
		try {
			const response = await fetch(IANA_RDAP_BOOTSTRAP_URL, {
				headers: {
					Accept: "application/json",
					"User-Agent": "Reloop-Domain-Age-Checker/1.0",
				},
				signal: controller.signal,
			});
			if (!response.ok) {
				return ianaBootstrapCache?.map ?? new Map();
			}
			const data = (await response.json()) as {
				services?: Array<[string[], string[]]>;
			};
			const map = parseIanaRdapBootstrap(data);
			ianaBootstrapCache = { loadedAt: Date.now(), map };
			return map;
		} finally {
			clearTimeout(timeoutId);
		}
	} catch {
		return ianaBootstrapCache?.map ?? new Map();
	}
}

function tldOf(domainName: string): string {
	const parts = domainName.toLowerCase().split(".").filter(Boolean);
	return parts[parts.length - 1] ?? domainName.toLowerCase();
}

async function fetchRdapCreatedAt(url: string): Promise<Date | null> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const response = await fetch(url, {
			headers: {
				Accept: "application/rdap+json, application/json",
				"User-Agent": "Reloop-Domain-Age-Checker/1.0",
			},
			signal: controller.signal,
		});
		if (!response.ok) return null;
		const body: unknown = await response.json().catch(() => null);
		return parseRdapCreatedAt(body);
	} catch {
		return null;
	} finally {
		clearTimeout(timeoutId);
	}
}

/** Best-effort RDAP registration date. Returns null when unknown or redacted. */
export async function lookupRdapCreatedAt(
	domainName: string,
): Promise<Date | null> {
	const normalized = domainName.trim().toLowerCase();
	if (!normalized) return null;

	const urls: string[] = [
		`https://rdap.org/domain/${encodeURIComponent(normalized)}`,
	];
	const bootstrap = await loadIanaRdapBootstrap();
	const base = bootstrap.get(tldOf(normalized));
	if (base) urls.push(joinRdapDomainUrl(base, normalized));

	for (const url of urls) {
		const createdAt = await fetchRdapCreatedAt(url);
		if (createdAt) return createdAt;
	}
	return null;
}
