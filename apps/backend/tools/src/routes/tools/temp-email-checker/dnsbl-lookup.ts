import dns from "node:dns/promises";
import { withDeadline } from "@be/tools/utils/deadline";

const DNSBL_TIMEOUT_MS = 1000;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 10_000;

export type DnsblLookupResult = {
	listed: boolean;
	records: string[];
	list?: string;
};

type CacheEntry = {
	result: DnsblLookupResult;
	expiresAt: number;
};

const cache = new Map<string, CacheEntry>();

function getCached(domain: string): DnsblLookupResult | null {
	const entry = cache.get(domain);
	if (!entry) return null;
	if (Date.now() > entry.expiresAt) {
		cache.delete(domain);
		return null;
	}
	return entry.result;
}

function setCached(domain: string, result: DnsblLookupResult): void {
	if (cache.size >= MAX_CACHE_SIZE) {
		const now = Date.now();
		for (const [key, value] of cache.entries()) {
			if (now > value.expiresAt) {
				cache.delete(key);
			}
		}
		if (cache.size >= MAX_CACHE_SIZE) {
			const firstKey = cache.keys().next().value;
			if (firstKey) cache.delete(firstKey);
		}
	}
	cache.set(domain, { result, expiresAt: Date.now() + CACHE_TTL_MS });
}

export function clearDnsblCache(): void {
	cache.clear();
}

/**
 * Checks if a domain is listed on SURBL (multi.surbl.org) as disposable or web spam.
 * SURBL codes:
 *   127.0.0.4  = WS (Disposable Mail / web spam)
 *   127.0.0.2  = SC (SpamCop)
 *   127.0.0.8  = PH (Phishing)
 *   127.0.0.16 = MW (Malware)
 */
export async function lookupDnsbl(domain: string): Promise<DnsblLookupResult> {
	const cleanDomain = domain.toLowerCase().trim().replace(/\.$/, "");
	if (!cleanDomain) return { listed: false, records: [] };

	const cached = getCached(cleanDomain);
	if (cached) return cached;

	const queryHost = `${cleanDomain}.multi.surbl.org`;

	try {
		// Use default system resolver rather than public open recursors (1.1.1.1/8.8.8.8)
		// because SURBL rejects open public resolvers with ESERVFAIL.
		const records = await withDeadline(
			dns.resolve4(queryHost),
			DNSBL_TIMEOUT_MS,
			"DNSBL",
		);

		if (Array.isArray(records) && records.length > 0) {
			const isListed = records.some((ip) => {
				if (!ip.startsWith("127.0.0.")) return false;
				const lastOctet = Number.parseInt(ip.split(".")[3] ?? "0", 10);
				// Bit 4 is WS/DM (disposable mail); any listed 127.0.0.x is a threat
				return !Number.isNaN(lastOctet) && lastOctet > 0;
			});

			const result: DnsblLookupResult = {
				listed: isListed,
				records,
				list: isListed ? "surbl" : undefined,
			};

			setCached(cleanDomain, result);
			return result;
		}

		const result: DnsblLookupResult = { listed: false, records: [] };
		setCached(cleanDomain, result);
		return result;
	} catch (error: unknown) {
		// ENOTFOUND / ENODATA means domain is not listed
		const code =
			error && typeof error === "object" && "code" in error
				? String(error.code)
				: "";

		if (code === "ENOTFOUND" || code === "ENODATA") {
			const result: DnsblLookupResult = { listed: false, records: [] };
			setCached(cleanDomain, result);
			return result;
		}

		// On network error or timeout, fail open safely without blocking the user
		return { listed: false, records: [] };
	}
}
