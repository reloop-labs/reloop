import { isPrivateOrReservedIpv4 } from "../../blocklist-check/blocklist-input";
import {
	DOMAIN_DNSBL_PROVIDERS,
	IP_DNSBL_PROVIDERS,
} from "../../blocklist-check/dnsbl-providers";
import {
	type DnsblItemResult,
	querySingleDnsbl,
	reverseIpForDnsbl,
} from "../../blocklist-check/dnsbl-query";
import type { CategoryResult, CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface BlacklistsCheckResult {
	category: CategoryResult;
	listedCount: number;
	cleanCount: number;
	errorCount: number;
	totalChecked: number;
	ipResults: DnsblItemResult[];
	domainResults: DnsblItemResult[];
}

export async function checkBlacklists(
	email: ParsedEmailData,
): Promise<BlacklistsCheckResult> {
	const items: CheckItem[] = [];
	const ipResults: DnsblItemResult[] = [];
	const domainResults: DnsblItemResult[] = [];

	const ip = email.connectingIp;
	const isLocalIp =
		!ip ||
		ip.startsWith("127.") ||
		ip === "::1" ||
		ip === "0.0.0.0" ||
		isPrivateOrReservedIpv4(ip);

	// 1. IP DNSBL queries
	if (!isLocalIp && ip) {
		const ipPromises = IP_DNSBL_PROVIDERS.map(async (provider) => {
			const reversed = reverseIpForDnsbl(ip);
			const result = await querySingleDnsbl({
				queryName: `${reversed}.${provider.host}`,
				targetLabel: ip,
				provider,
			});
			return result;
		});

		const resolvedIpResults = await Promise.all(ipPromises);
		ipResults.push(...resolvedIpResults);
	}

	// 2. Domain DNSBL queries
	const domainsToCheck = new Set<string>();
	if (email.from.domain) domainsToCheck.add(email.from.domain.toLowerCase());
	if (email.returnPath && email.returnPath.includes("@")) {
		const parts = email.returnPath.split("@");
		if (parts[1]) domainsToCheck.add(parts[1].toLowerCase());
	}

	const domainPromises: Promise<DnsblItemResult>[] = [];
	for (const domain of domainsToCheck) {
		for (const provider of DOMAIN_DNSBL_PROVIDERS) {
			domainPromises.push(
				querySingleDnsbl({
					queryName: `${domain}.${provider.host}`,
					targetLabel: domain,
					provider,
				}),
			);
		}
	}

	const resolvedDomainResults = await Promise.all(domainPromises);
	domainResults.push(...resolvedDomainResults);

	// Tally statistics
	const allResults = [...ipResults, ...domainResults];
	let listedCount = 0;
	let cleanCount = 0;
	let errorCount = 0;
	let totalMarkDeduction = 0;

	for (const res of allResults) {
		if (res.status === "listed") {
			listedCount++;
			let penalty = 0;
			if (res.impact === "high") {
				penalty = res.listType === "ip" ? -2.5 : -2.0;
			} else if (res.impact === "medium") {
				penalty = -1.0;
			} else {
				penalty = -0.5;
			}
			totalMarkDeduction += penalty;

			const target = res.listedTargets[0] || res.host;
			items.push({
				id: `dnsbl-${res.id}`,
				title: `${res.name} (${target})`,
				mark: penalty,
				status: "fail",
				description: `Listed on ${res.name}. ${res.description}`,
				details: [
					`Target: ${target}`,
					`Response codes: ${res.responseCodes.join(", ") || "Listed"}`,
					res.txtRecord ? `TXT Record: ${res.txtRecord}` : "",
					`Delisting URL: ${res.delistUrl}`,
				].filter(Boolean),
				recommendations: [
					`Visit ${res.delistUrl} to review listing reasons and request removal.`,
				],
			});
		} else if (res.status === "not_listed") {
			cleanCount++;
		} else if (res.status === "error") {
			errorCount++;
		}
	}

	// If clean, add positive summary items
	if (listedCount === 0) {
		if (ipResults.length > 0) {
			items.push({
				id: "dnsbl-ip-clean",
				title: `IP Reputation (${cleanCount} DNSBLs clean)`,
				mark: 0,
				status: "pass",
				description: `Sending IP ${ip} is not listed on any of the queried IP blocklists.`,
				details: [
					`Checked ${ipResults.length} major IP blocklists (Spamhaus, Barracuda, SpamCop, etc.).`,
				],
			});
		}

		if (domainResults.length > 0) {
			items.push({
				id: "dnsbl-domain-clean",
				title: "Domain Reputation (Clean)",
				mark: 0,
				status: "pass",
				description:
					"Sender domains are not listed on domain URI blocklists (Spamhaus DBL, URIBL, SURBL).",
				details: Array.from(domainsToCheck).map((d) => `Domain clean: ${d}`),
			});
		}

		if (isLocalIp) {
			items.push({
				id: "dnsbl-skipped",
				title: "IP Blocklist Check",
				mark: 0,
				status: "info",
				description:
					"Sending IP is local, private, or a documentation test address; IP DNSBL queries were skipped.",
			});
		}
	}

	if (errorCount > 0) {
		items.push({
			id: "dnsbl-inconclusive-notes",
			title: "Inconclusive DNSBL Queries",
			mark: 0,
			status: "info",
			description: `${errorCount} blocklist query(ies) returned timeouts or refused responses. Inconclusive queries are not treated as clean.`,
		});
	}

	const categoryStatus =
		listedCount > 0
			? "fail"
			: errorCount > 0 && cleanCount === 0
				? "warn"
				: "pass";

	return {
		category: {
			id: "blacklists",
			title: "Blacklists / DNSBL",
			mark: Math.max(-10, totalMarkDeduction),
			status: categoryStatus,
			items,
		},
		listedCount,
		cleanCount,
		errorCount,
		totalChecked: allResults.length,
		ipResults,
		domainResults,
	};
}
