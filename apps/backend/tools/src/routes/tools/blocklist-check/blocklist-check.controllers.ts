import net from "node:net";
import { ToolsErrors } from "@be/tools/error/tools.error-response";
import {
	type CheckedIp,
	type IpVersion,
	isPlausibleDomain,
	isPrivateOrReservedIpv4,
	lookupSpf,
	parseTarget,
	resolveDomainMailIps,
	reverseHostname,
} from "./blocklist-input";
import {
	DNSBL_PROVIDERS,
	DOMAIN_DNSBL_PROVIDERS,
	IP_DNSBL_PROVIDERS,
} from "./dnsbl-providers";
import {
	aggregateVerdict,
	type BlocklistVerdict,
	type DnsblItemResult,
	mergeIpListResults,
	querySingleDnsbl,
	reverseIpForDnsbl,
	skippedResult,
} from "./dnsbl-query";

export type { DnsblProvider } from "./dnsbl-providers";
export { DNSBL_PROVIDERS, IP_DNSBL_PROVIDERS, DOMAIN_DNSBL_PROVIDERS };

export type { DnsblItemResult, BlocklistVerdict };

export interface BlocklistCheckResult {
	target: string;
	inputType: "domain" | "ip";
	ipVersion: IpVersion | null;
	resolvedIp: string | null;
	hostname: string | null;
	checkedIps: CheckedIp[];
	spfIncludes: string[];
	spfRanges: string[];
	ipNote: string | null;
	verdict: BlocklistVerdict;
	isClean: boolean;
	totalChecked: number;
	listedCount: number;
	cleanCount: number;
	errorCount: number;
	skippedCount: number;
	scanDurationMs: number;
	results: DnsblItemResult[];
	recommendations: string[];
}

function ipVersionOf(ip: string): IpVersion {
	return net.isIPv6(ip) ? "ipv6" : "ipv4";
}

function uniqueIps(ips: string[]): string[] {
	return [...new Set(ips)];
}

function buildRecommendations(result: {
	verdict: BlocklistVerdict;
	listedCount: number;
	errorCount: number;
	inputType: "domain" | "ip";
	checkedIps: CheckedIp[];
	spfIncludes: string[];
	ipNote: string | null;
}): string[] {
	const lines: string[] = [];

	if (result.verdict === "listed") {
		lines.push(
			`Listed on ${result.listedCount} list(s). Fix the cause (traps, compromised hosts, unauthenticated mail), then use the list's own removal form.`,
		);
	} else if (result.verdict === "inconclusive") {
		lines.push(
			"No confirmed listings, but at least one high-impact list did not answer. That is not a clean bill of health — retry, or query that list from a dedicated resolver.",
		);
	} else {
		lines.push(
			"No listings on the lists that returned a definitive answer. This is not a guarantee of inbox placement; Gmail, Microsoft, and Yahoo keep private reputation data.",
		);
	}

	if (result.errorCount > 0) {
		lines.push(
			`${result.errorCount} list(s) timed out, refused the query, or returned an error. Failed queries are reported as errors, not as clean.`,
		);
	}

	if (result.ipNote) {
		lines.push(result.ipNote);
	} else if (result.inputType === "domain" && result.checkedIps.length === 0) {
		lines.push(
			"No dedicated ip4:/ip6: sending addresses were found on this domain's SPF record. Enter the SMTP IP from a bounce or your ESP dashboard to check IP lists. include: mechanisms (Google, Microsoft, Amazon, and other ESPs) were not expanded.",
		);
	}

	if (result.spfIncludes.length > 0 && result.checkedIps.length === 0) {
		lines.push(
			`SPF delegates sending via include: (${result.spfIncludes.slice(0, 4).join(", ")}). Shared provider IPs are not checked here.`,
		);
	}

	return lines;
}

async function queryIpProviders(
	checkedIps: CheckedIp[],
): Promise<DnsblItemResult[]> {
	if (checkedIps.length === 0) {
		return IP_DNSBL_PROVIDERS.map((provider) =>
			skippedResult(
				provider,
				"No sending IP to query. Enter an IP, or publish ip4:/ip6: in SPF.",
			),
		);
	}

	return Promise.all(
		IP_DNSBL_PROVIDERS.map(async (provider) => {
			const parts = await Promise.all(
				checkedIps.map((item) => {
					const supported =
						item.version === "ipv6"
							? provider.supportsIpv6
							: provider.supportsIpv4;
					if (!supported) {
						return skippedResult(
							provider,
							item.version === "ipv6"
								? "This list does not publish an IPv6 zone."
								: "This list does not publish an IPv4 zone.",
						);
					}
					const reversed = reverseIpForDnsbl(item.ip);
					return querySingleDnsbl({
						queryName: `${reversed}.${provider.host}`,
						targetLabel: item.ip,
						provider,
					});
				}),
			);
			return mergeIpListResults(provider, parts);
		}),
	);
}

async function queryDomainProviders(
	domain: string,
): Promise<DnsblItemResult[]> {
	return Promise.all(
		DOMAIN_DNSBL_PROVIDERS.map((provider) =>
			querySingleDnsbl({
				queryName: `${domain}.${provider.host}`,
				targetLabel: domain,
				provider,
			}),
		),
	);
}

export async function checkBlocklistController(
	rawInput: string,
): Promise<BlocklistCheckResult> {
	const startTime = Date.now();
	const parsed = parseTarget(rawInput);

	if (!parsed.target) {
		throw ToolsErrors.blocklistEmptyInput();
	}

	if (parsed.inputType === "domain" && !isPlausibleDomain(parsed.target)) {
		throw ToolsErrors.blocklistInvalidTarget();
	}

	const checkedIps: CheckedIp[] = [];
	let hostname: string | null = null;
	let spfIncludes: string[] = [];
	let spfRanges: string[] = [];
	let ipNote: string | null = null;

	if (parsed.inputType === "ip") {
		checkedIps.push({
			ip: parsed.target,
			source: "input",
			version: parsed.ipVersion ?? ipVersionOf(parsed.target),
		});
		hostname = await reverseHostname(parsed.target);
		if (parsed.ipVersion === "ipv4" && isPrivateOrReservedIpv4(parsed.target)) {
			ipNote =
				"This address is private or reserved. DNSBL hits on RFC1918 space are not meaningful for public mail delivery. 127.0.0.2 is the RFC 5782 test listing and is expected to be listed.";
		}
	} else {
		hostname = parsed.target;
		const spf = await lookupSpf(parsed.target);
		spfIncludes = spf.includes;
		spfRanges = spf.ranges;
		for (const ip of uniqueIps(spf.ips).slice(0, 5)) {
			checkedIps.push({
				ip,
				source: "spf",
				version: ipVersionOf(ip),
			});
		}

		if (checkedIps.length === 0) {
			const resolved = await resolveDomainMailIps(parsed.target);
			if (resolved.ips.length > 0) {
				for (const ip of uniqueIps(resolved.ips).slice(0, 3)) {
					checkedIps.push({
						ip,
						source: "spf",
						version: ipVersionOf(ip),
					});
				}
				if (resolved.source === "mx") {
					ipNote = `Queried MX mail server IP (${resolved.ips[0]}) for IP blocklists.`;
				}
			} else if (spf.ranges.length > 0) {
				ipNote = `SPF publishes CIDR ranges (${spf.ranges.slice(0, 3).join(", ")}) rather than single sending IPs. Enter a specific SMTP IP to check IP lists.`;
			}
		}
	}

	const ipResultsPromise = queryIpProviders(checkedIps);
	const domainResultsPromise =
		parsed.inputType === "domain"
			? queryDomainProviders(parsed.target)
			: Promise.resolve(
					DOMAIN_DNSBL_PROVIDERS.map((provider) =>
						skippedResult(
							provider,
							"Domain URI lists are not queried for a raw IP address.",
						),
					),
				);

	const [ipResults, domainResults] = await Promise.all([
		ipResultsPromise,
		domainResultsPromise,
	]);

	const results = [...ipResults, ...domainResults];
	const stats = aggregateVerdict(results);
	const resolvedIp = checkedIps[0]?.ip ?? null;

	const payload = {
		verdict: stats.verdict,
		listedCount: stats.listedCount,
		errorCount: stats.errorCount,
		inputType: parsed.inputType,
		checkedIps,
		spfIncludes,
		ipNote,
	};

	return {
		target: parsed.target,
		inputType: parsed.inputType,
		ipVersion: parsed.ipVersion,
		resolvedIp,
		hostname,
		checkedIps,
		spfIncludes,
		spfRanges,
		ipNote,
		verdict: stats.verdict,
		isClean: stats.isClean,
		totalChecked: results.length,
		listedCount: stats.listedCount,
		cleanCount: stats.cleanCount,
		errorCount: stats.errorCount,
		skippedCount: stats.skippedCount,
		scanDurationMs: Date.now() - startTime,
		results,
		recommendations: buildRecommendations(payload),
	};
}
