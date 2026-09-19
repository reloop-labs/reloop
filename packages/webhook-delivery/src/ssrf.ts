import dns from "node:dns";
import net from "node:net";

function ipv4Parts(ip: string): number[] | null {
	const parts = ip.split(".").map(Number);
	if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return null;
	return parts;
}

export function isPrivateNetworkIP(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const parts = ipv4Parts(ip);
		if (!parts) return true;

		if (parts[0] === 127) return true;
		if (parts[0] === 10) return true;
		if (
			parts[0] === 172 &&
			parts[1] !== undefined &&
			parts[1] >= 16 &&
			parts[1] <= 31
		)
			return true;
		if (parts[0] === 192 && parts[1] === 168) return true;
		return false;
	}

	if (net.isIPv6(ip)) {
		const normalized = ip.toLowerCase();
		if (normalized === "::1") return true;
		if (normalized.startsWith("::ffff:")) {
			const v4 = normalized.slice("::ffff:".length);
			if (net.isIPv4(v4)) return isPrivateNetworkIP(v4);
		}
		if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
			return true;
		}
		return false;
	}

	return true;
}

export function isAlwaysBlockedIP(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const parts = ipv4Parts(ip);
		if (!parts) return true;

		if (parts[0] === 0) return true;
		if (
			parts[0] === 100 &&
			parts[1] !== undefined &&
			parts[1] >= 64 &&
			parts[1] <= 127
		)
			return true;
		if (parts[0] === 169 && parts[1] === 254) return true;
		if (
			parts[0] === 198 &&
			parts[1] !== undefined &&
			(parts[1] === 18 || parts[1] === 19)
		)
			return true;
		if (parts[0] !== undefined && parts[0] >= 224) return true;
		return false;
	}

	if (net.isIPv6(ip)) {
		const normalized = ip.toLowerCase();
		if (normalized === "::") return true;
		if (normalized.startsWith("::ffff:")) {
			const v4 = normalized.slice("::ffff:".length);
			if (net.isIPv4(v4)) return isAlwaysBlockedIP(v4);
		}
		if (
			normalized.startsWith("fe8") ||
			normalized.startsWith("fe9") ||
			normalized.startsWith("fea") ||
			normalized.startsWith("feb")
		) {
			return true;
		}
		return false;
	}

	return true;
}

export function isPrivateOrBlockedIP(ip: string): boolean {
	return isPrivateNetworkIP(ip) || isAlwaysBlockedIP(ip);
}

function isBlockedForTarget(ip: string, allowPrivate: boolean): boolean {
	if (isAlwaysBlockedIP(ip)) return true;
	if (allowPrivate) return false;
	return isPrivateNetworkIP(ip);
}

export type ResolvedTarget = {
	hostname: string;
	pinnedIp: string;
	allIps: string[];
	family: 4 | 6;
};

export async function resolvePublicTarget(
	hostname: string,
	options?: { allowPrivate?: boolean },
): Promise<ResolvedTarget> {
	hostname = hostname.replace(/^\[|\]$/g, "");
	const allowPrivate = options?.allowPrivate === true;
	if (net.isIP(hostname)) {
		if (isBlockedForTarget(hostname, allowPrivate)) {
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
		if (isBlockedForTarget(ip, allowPrivate)) {
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
