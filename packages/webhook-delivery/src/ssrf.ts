import dns from "node:dns";
import net from "node:net";

export function isPrivateOrBlockedIP(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const parts = ip.split(".").map(Number);
		if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;

		// Loopback 127.0.0.0/8
		if (parts[0] === 127) return true;
		// "This" network 0.0.0.0/8
		if (parts[0] === 0) return true;
		// Private 10.0.0.0/8
		if (parts[0] === 10) return true;
		// CGNAT 100.64.0.0/10
		if (
			parts[0] === 100 &&
			parts[1] !== undefined &&
			parts[1] >= 64 &&
			parts[1] <= 127
		)
			return true;
		// Private 172.16.0.0/12
		if (
			parts[0] === 172 &&
			parts[1] !== undefined &&
			parts[1] >= 16 &&
			parts[1] <= 31
		)
			return true;
		// Private 192.168.0.0/16
		if (parts[0] === 192 && parts[1] === 168) return true;
		// Link-local 169.254.0.0/16 (includes AWS metadata 169.254.169.254)
		if (parts[0] === 169 && parts[1] === 254) return true;
		// Benchmarking 198.18.0.0/15
		if (
			parts[0] === 198 &&
			parts[1] !== undefined &&
			(parts[1] === 18 || parts[1] === 19)
		)
			return true;
		// Multicast / reserved
		if (parts[0] !== undefined && parts[0] >= 224) return true;

		return false;
	}

	if (net.isIPv6(ip)) {
		const normalized = ip.toLowerCase();
		if (normalized === "::1" || normalized === "::") return true;
		// IPv4-mapped IPv6
		if (normalized.startsWith("::ffff:")) {
			const v4 = normalized.slice("::ffff:".length);
			if (net.isIPv4(v4)) return isPrivateOrBlockedIP(v4);
		}
		// Link-local fe80::/10
		if (
			normalized.startsWith("fe8") ||
			normalized.startsWith("fe9") ||
			normalized.startsWith("fea") ||
			normalized.startsWith("feb")
		) {
			return true;
		}
		// Unique local fc00::/7
		if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
			return true;
		}
		return false;
	}

	return true;
}

export type ResolvedTarget = {
	hostname: string;
	/** First public IP chosen for the connection. */
	pinnedIp: string;
	/** All resolved addresses (for logging). */
	allIps: string[];
	family: 4 | 6;
};

/**
 * Resolve hostname and reject if any resolved address is private/blocked.
 * Returns a single public IP to pin for the outbound connection.
 */
export async function resolvePublicTarget(
	hostname: string,
): Promise<ResolvedTarget> {
	if (net.isIP(hostname)) {
		if (isPrivateOrBlockedIP(hostname)) {
			throw new SsrfBlockedError(
				`Outbound request to private/local IP address ${hostname} is blocked`,
			);
		}
		const family = net.isIPv6(hostname) ? 6 : 4;
		return {
			hostname,
			pinnedIp: hostname,
			allIps: [hostname],
			family,
		};
	}

	const results = await dns.promises.lookup(hostname, { all: true });
	if (results.length === 0) {
		throw new SsrfBlockedError(
			`DNS lookup returned no addresses for ${hostname}`,
		);
	}

	const ips = results.map((r) => r.address);
	for (const ip of ips) {
		if (isPrivateOrBlockedIP(ip)) {
			throw new SsrfBlockedError(
				`Outbound request to private/local IP address ${ip} is blocked`,
			);
		}
	}

	const first = results[0];
	if (!first) {
		throw new SsrfBlockedError(
			`DNS lookup returned no addresses for ${hostname}`,
		);
	}

	return {
		hostname,
		pinnedIp: first.address,
		allIps: ips,
		family: first.family === 6 ? 6 : 4,
	};
}

export class SsrfBlockedError extends Error {
	readonly code = "SSRF_BLOCKED" as const;

	constructor(message: string) {
		super(message);
		this.name = "SsrfBlockedError";
	}
}
