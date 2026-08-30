import net from "node:net";
import { ToolsErrors } from "@be/tools/error/tools.error-response";
import {
	type CheckedIp,
	type IpVersion,
	isPlausibleDomain,
	isPrivateOrReservedIpv4,
	lookupSpf,
	parseTarget,
	resolveDomainMxIps,
	resolveDomainWebIps,
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
			`Listed on ${result.listedCount} blocklist(s). Review the listed providers below for removal and remediation steps.`,
		);
	} else if (result.verdict === "inconclusive") {
		lines.push(
			"No listings confirmed, but some high-impact lists did not respond. Try querying again or testing with a dedicated IP.",
		);
	} else {
		lines.push(
			"All queried public DNS blocklists returned clean. Your sending server and domain are not currently blocked on major public lists.",
		);
	}

	if (result.errorCount > 0) {
		lines.push(
			`${result.errorCount} list(s) timed out or refused queries (public DNS resolvers are often rate-limited by some DNSBLs).`,
		);
	}

	if (result.ipNote) {
		lines.push(result.ipNote);
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

		const [mxIps, webIps] = await Promise.all([
			resolveDomainMxIps(parsed.target),
			resolveDomainWebIps(parsed.target),
		]);

		// Add MX mail server IPs
		for (const ip of uniqueIps(mxIps).slice(0, 3)) {
			if (!checkedIps.some((c) => c.ip === ip)) {
				checkedIps.push({
					ip,
					source: "mx",
					version: ipVersionOf(ip),
				});
			}
		}

		// Also add domain web hosting IP (A record)
		for (const ip of uniqueIps(webIps).slice(0, 2)) {
			if (!checkedIps.some((c) => c.ip === ip)) {
				checkedIps.push({
					ip,
					source: "a",
					version: ipVersionOf(ip),
				});
			}
		}

		if (checkedIps.length > 0) {
			const sources = [...new Set(checkedIps.map((c) => c.source))];
			const labels = sources.map((s) => {
				if (s === "spf") return "SPF dedicated IPs";
				if (s === "mx") return "MX mail server IP";
				if (s === "a") return "website hosting IP";
				return "IP";
			});
			ipNote = `Queried ${labels.join(" and ")} for IP blocklists.`;
		} else if (spf.ranges.length > 0) {
			ipNote = `SPF publishes CIDR ranges (${spf.ranges.slice(0, 3).join(", ")}) rather than single sending IPs. Enter a specific SMTP IP to check IP lists.`;
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
