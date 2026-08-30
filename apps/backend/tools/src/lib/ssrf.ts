import dns from "node:dns";
import net from "node:net";

export function isPrivateOrBlockedIP(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const parts = ip.split(".").map(Number);
		if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
		if (parts[0] === 127) return true;
		if (parts[0] === 0) return true;
		if (parts[0] === 10) return true;
		if (
			parts[0] === 100 &&
			parts[1] !== undefined &&
			parts[1] >= 64 &&
			parts[1] <= 127
		)
			return true;
		if (
			parts[0] === 172 &&
			parts[1] !== undefined &&
			parts[1] >= 16 &&
			parts[1] <= 31
		)
			return true;
		if (parts[0] === 192 && parts[1] === 168) return true;
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
		if (normalized === "::1" || normalized === "::") return true;
		if (normalized.startsWith("::ffff:")) {
			const v4 = normalized.slice("::ffff:".length);
			if (net.isIPv4(v4)) return isPrivateOrBlockedIP(v4);
		}
		if (
			normalized.startsWith("fe8") ||
			normalized.startsWith("fe9") ||
			normalized.startsWith("fea") ||
			normalized.startsWith("feb")
		) {
			return true;
		}
		if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
			return true;
		}
		return false;
	}

	return true;
}

const BLOCKED_HOSTS = new Set([
	"localhost",
	"localhost.localdomain",
	"metadata.google.internal",
	"metadata",
]);

export function isBlockedHostname(hostname: string): boolean {
	const host = hostname.trim().toLowerCase().replace(/\.$/, "");
	if (!host) return true;
	if (BLOCKED_HOSTS.has(host)) return true;
	if (host.endsWith(".localhost") || host.endsWith(".internal")) return true;
	if (net.isIP(host) && isPrivateOrBlockedIP(host)) return true;
	return false;
}

export type HostnameLookup = (
	hostname: string,
) => Promise<ReadonlyArray<{ address: string; family?: number }>>;

export async function hostnameResolvesPublic(
	hostname: string,
	lookup: HostnameLookup = (name) => dns.promises.lookup(name, { all: true }),
): Promise<boolean> {
	if (net.isIP(hostname)) return !isPrivateOrBlockedIP(hostname);

	const results = await lookup(hostname);
	if (results.length === 0) return false;
	return results.every((entry) => !isPrivateOrBlockedIP(entry.address));
}
