import dns from "node:dns/promises";
import net from "node:net";
import type { CheckItem } from "../deliverability-test.types";
import type { ParsedEmailData } from "./parse-mime";

export interface RdnsCheckResult {
	rdnsItem: CheckItem;
	heloItem: CheckItem;
	ip: string | null;
	ptrHostname: string | null;
	fcRdnsPassed: boolean;
}

export async function checkRdns(email: ParsedEmailData): Promise<RdnsCheckResult> {
	const ip = email.connectingIp;

	if (!ip || ip.startsWith("127.") || ip === "::1" || ip === "0.0.0.0") {
		return {
			rdnsItem: {
				id: "auth-rdns",
				title: "Reverse DNS (PTR & FCrDNS)",
				mark: 0,
				status: "info",
				description: "Sending IP is local or private; rDNS check was skipped.",
				details: [ip ? `Connecting IP: ${ip}` : "No connecting IP detected"],
			},
			heloItem: {
				id: "auth-helo",
				title: "HELO/EHLO Hostname",
				mark: 0,
				status: "info",
				description: email.heloDomain
					? `HELO/EHLO domain provided: "${email.heloDomain}".`
					: "No HELO banner recorded.",
			},
			ip,
			ptrHostname: null,
			fcRdnsPassed: true,
		};
	}

	// 1. Reverse DNS (PTR)
	let ptrHostname: string | null = null;
	let fcRdnsPassed = false;

	try {
		const hostnames = await dns.reverse(ip);
		if (hostnames.length > 0 && hostnames[0]) {
			const resolvedHost = hostnames[0];
			ptrHostname = resolvedHost;

			// Forward confirm (FCrDNS)
			try {
				const isV6 = net.isIPv6(ip);
				if (isV6) {
					const resolvedV6 = await dns.resolve6(resolvedHost);
					fcRdnsPassed = resolvedV6.includes(ip);
				} else {
					const resolvedV4 = await dns.resolve4(resolvedHost);
					fcRdnsPassed = resolvedV4.includes(ip);
				}
			} catch {
				fcRdnsPassed = false;
			}
		}
	} catch {
		ptrHostname = null;
	}

	let rdnsItem: CheckItem;
	if (!ptrHostname) {
		rdnsItem = {
			id: "auth-rdns",
			title: "Reverse DNS (PTR & FCrDNS)",
			mark: -1.5,
			status: "fail",
			description: `No reverse DNS (PTR record) found for connecting IP ${ip}.`,
			details: [
				`IP Address: ${ip}`,
				"Mail servers without reverse DNS are blocked or placed in spam by major inbox providers (Google, Yahoo, Microsoft).",
			],
			recommendations: [
				`Contact your hosting provider or ISP to set up a PTR record for ${ip} pointing to your mail server hostname.`,
			],
		};
	} else if (!fcRdnsPassed) {
		rdnsItem = {
			id: "auth-rdns",
			title: "Reverse DNS (PTR & FCrDNS)",
			mark: -0.5,
			status: "warn",
			description: `PTR record points to "${ptrHostname}", but forward-confirmation (FCrDNS) failed to resolve back to ${ip}.`,
			details: [
				`IP Address: ${ip}`,
				`PTR Hostname: ${ptrHostname}`,
				`Forward check: "${ptrHostname}" does not resolve back to ${ip}`,
			],
			recommendations: [
				`Create an A/AAAA record for "${ptrHostname}" pointing to ${ip} so that reverse and forward DNS match.`,
			],
		};
	} else {
		rdnsItem = {
			id: "auth-rdns",
			title: "Reverse DNS (PTR & FCrDNS)",
			mark: 0,
			status: "pass",
			description: `Reverse DNS is correctly configured and forward-confirmed (${ptrHostname} ↔ ${ip}).`,
			details: [
				`Connecting IP: ${ip}`,
				`PTR Hostname: ${ptrHostname}`,
				"Forward-Confirmed Reverse DNS (FCrDNS): Valid",
			],
		};
	}

	// 2. HELO/EHLO check
	const helo = email.heloDomain;
	let heloItem: CheckItem;

	if (!helo) {
		heloItem = {
			id: "auth-helo",
			title: "HELO/EHLO Hostname",
			mark: 0,
			status: "info",
			description: "HELO/EHLO banner was not recorded.",
		};
	} else if (helo.toLowerCase() === "localhost" || helo === "127.0.0.1" || helo.includes("localdomain")) {
		heloItem = {
			id: "auth-helo",
			title: "HELO/EHLO Hostname",
			mark: -0.5,
			status: "warn",
			description: `HELO hostname "${helo}" is generic or localhost.`,
			details: [`Reported HELO: ${helo}`],
			recommendations: [
				"Configure your MTA (Postfix, Exim, KumoMTA) to announce a fully qualified domain name (FQDN) in HELO/EHLO.",
			],
		};
	} else {
		heloItem = {
			id: "auth-helo",
			title: "HELO/EHLO Hostname",
			mark: 0,
			status: "pass",
			description: `HELO/EHLO announced valid hostname: "${helo}".`,
			details: [`Reported HELO: ${helo}`],
		};
	}

	return {
		rdnsItem,
		heloItem,
		ip,
		ptrHostname,
		fcRdnsPassed,
	};
}
