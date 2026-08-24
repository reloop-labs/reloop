import dns from "node:dns/promises";
import net from "node:net";
import { domainToASCII } from "node:url";
import { withDeadline } from "@be/tools/utils/deadline";

const publicResolver = new dns.Resolver();
publicResolver.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

const RESOLVE_TIMEOUT_MS = 1500;

export type InputType = "domain" | "ip";
export type IpVersion = "ipv4" | "ipv6";
export type CheckedIpSource = "input" | "spf";

export interface CheckedIp {
	ip: string;
	source: CheckedIpSource;
	version: IpVersion;
}

export interface ParsedTarget {
	target: string;
	inputType: InputType;
	ipVersion: IpVersion | null;
}

export interface SpfExtraction {
	ips: string[];
	includes: string[];
	ranges: string[];
}

const PRIVATE_V4 = [
	/^10\./,
	/^127\./,
	/^169\.254\./,
	/^192\.168\./,
	/^172\.(1[6-9]|2\d|3[0-1])\./,
	/^0\./,
	/^100\.(6[4-9]|[7-9]\d|1[0-2]\d)\./,
];

export function isRfc5782TestAddress(ip: string): boolean {
	return ip === "127.0.0.2" || ip === "127.0.0.1";
}

export function isPrivateOrReservedIpv4(ip: string): boolean {
	if (!net.isIPv4(ip)) return false;
	if (isRfc5782TestAddress(ip)) return false;
	return PRIVATE_V4.some((pattern) => pattern.test(ip));
}

export function normalizeTarget(rawInput: string): string {
	let cleaned = (rawInput || "").trim().toLowerCase();
	cleaned = cleaned.replace(/^https?:\/\//i, "");
	const slash = cleaned.search(/[/?#]/);
	if (slash !== -1) cleaned = cleaned.slice(0, slash);
	cleaned = cleaned.replace(/\.$/, "");

	const at = cleaned.lastIndexOf("@");
	if (at !== -1) cleaned = cleaned.slice(at + 1);

	const bracketed = cleaned.match(/^\[([^\]]+)\](?::\d+)?$/);
	if (bracketed?.[1]) return bracketed[1];

	if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(cleaned)) {
		return cleaned.replace(/:\d+$/, "");
	}

	if (
		!net.isIPv6(cleaned) &&
		!cleaned.includes("::") &&
		/^[a-z0-9.-]+:\d+$/i.test(cleaned)
	) {
		return cleaned.replace(/:\d+$/, "");
	}

	return cleaned;
}

export function parseTarget(rawInput: string): ParsedTarget {
	const target = normalizeTarget(rawInput);

	if (net.isIPv4(target)) {
		return { target, inputType: "ip", ipVersion: "ipv4" };
	}
	if (net.isIPv6(target)) {
		return { target, inputType: "ip", ipVersion: "ipv6" };
	}

	let ascii = target;
	try {
		ascii = domainToASCII(target) || target;
	} catch {
		ascii = target;
	}

	return { target: ascii, inputType: "domain", ipVersion: null };
}

export function isPlausibleDomain(domain: string): boolean {
	if (!domain || domain.length > 253) return false;
	if (!domain.includes(".")) return false;
	if (/\s/.test(domain)) return false;
	return /^[a-z0-9._-]+$/i.test(domain);
}

/**
 * Reads ip4:/ip6: from a single SPF record. Does not follow include:
 * (those are usually shared ESP ranges and must not be treated as "your" IPs).
 * redirect= replaces the record and is followed by the caller.
 */
export function extractSpfMechanisms(spfRecord: string): SpfExtraction {
	const ips: string[] = [];
	const includes: string[] = [];
	const ranges: string[] = [];
	let redirect: string | undefined;

	for (const token of spfRecord.trim().split(/\s+/)) {
		const value = token.replace(/^[+?~-]/, "");
		if (value.startsWith("redirect=")) {
			redirect = value.slice("redirect=".length);
			continue;
		}
		if (value.startsWith("include:")) {
			includes.push(value.slice("include:".length));
			continue;
		}
		if (value.startsWith("ip4:")) {
			const spec = value.slice(4);
			if (spec.includes("/") && !spec.endsWith("/32")) {
				ranges.push(spec);
			} else {
				const ip = spec.replace(/\/32$/, "");
				if (net.isIPv4(ip)) ips.push(ip);
			}
			continue;
		}
		if (value.startsWith("ip6:")) {
			const spec = value.slice(4);
			if (spec.includes("/") && !spec.endsWith("/128")) {
				ranges.push(spec);
			} else {
				const ip = spec.replace(/\/128$/, "");
				if (net.isIPv6(ip)) ips.push(ip);
			}
		}
	}

	return {
		ips,
		includes: redirect ? [...includes, `redirect:${redirect}`] : includes,
		ranges,
	};
}

function findSpfRecord(txts: string[][]): string | null {
	for (const chunks of txts) {
		const joined = chunks.join("").trim();
		if (/^v=spf1(?:\s|$)/i.test(joined)) return joined;
	}
	return null;
}

export async function lookupSpf(
	domain: string,
	resolver: dns.Resolver = publicResolver,
): Promise<SpfExtraction> {
	try {
		const txts = await withDeadline(
			resolver.resolveTxt(domain),
			RESOLVE_TIMEOUT_MS,
			"SPF TXT",
		);
		const record = findSpfRecord(txts);
		if (!record) {
			return { ips: [], includes: [], ranges: [] };
		}

		const extracted = extractSpfMechanisms(record);
		const redirect = extracted.includes.find((item) =>
			item.startsWith("redirect:"),
		);
		if (redirect) {
			const redirectDomain = redirect.slice("redirect:".length);
			if (redirectDomain && redirectDomain !== domain) {
				const redirected = await lookupSpf(redirectDomain, resolver);
				return {
					ips: [...extracted.ips, ...redirected.ips],
					includes: [
						...extracted.includes.filter(
							(item) => !item.startsWith("redirect:"),
						),
						...redirected.includes,
					],
					ranges: [...extracted.ranges, ...redirected.ranges],
				};
			}
		}

		return extracted;
	} catch {
		return { ips: [], includes: [], ranges: [] };
	}
}

export async function reverseHostname(
	ip: string,
	resolver: dns.Resolver = publicResolver,
): Promise<string | null> {
	try {
		const hostnames = await withDeadline(
			resolver.reverse(ip),
			RESOLVE_TIMEOUT_MS,
			"PTR",
		);
		return hostnames[0] ?? null;
	} catch {
		return null;
	}
}
