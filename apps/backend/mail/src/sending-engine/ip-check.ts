import type { DnsblQuery } from "./types";

/** Minimal DNSBL catalog entry the engine needs (full catalog lives in tools service). */
export interface DnsblEntry {
	id: string;
	host: string;
}

/** Reverse an IPv4 for DNSBL lookup: 1.2.3.4 -> 4.3.2.1 */
export function reverseIpv4(ip: string): string | null {
	const parts = ip.trim().split(".");
	if (parts.length !== 4 || !parts.every((p) => /^\d{1,3}$/.test(p)))
		return null;
	return [...parts].reverse().join(".");
}

/** Build the DNS query name for one (ip, blocklist) pair. */
export function buildDnsblQuery(
	ip: string,
	entry: DnsblEntry,
): DnsblQuery | null {
	const reversed = reverseIpv4(ip);
	if (!reversed) return null; // IPv6 / invalid handled by caller
	return {
		providerId: entry.id,
		host: entry.host,
		queryName: `${reversed}.${entry.host}`,
	};
}

/** Default high-signal lists checked on the hot path (cached, rest in background). */
export const HOT_PATH_DNSBL: DnsblEntry[] = [
	{ id: "spamhaus-zen", host: "zen.spamhaus.org" },
	{ id: "barracuda", host: "b.barracudacentral.org" },
	{ id: "spamcop", host: "bl.spamcop.net" },
];

export function buildHotPathQueries(ip: string): DnsblQuery[] {
	const out: DnsblQuery[] = [];
	for (const entry of HOT_PATH_DNSBL) {
		const q = buildDnsblQuery(ip, entry);
		if (q) out.push(q);
	}
	return out;
}
