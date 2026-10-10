/**
 * Self-contained SSRF guard for IP address classification.
 *
 * Replaces the `isPublicRoutableHost` import from `@better-auth/core/utils/host`
 * which relies on a wildcard (`*`) subpath export that Bun 1.4.2 on Linux
 * cannot resolve (works locally on macOS but fails in Docker).
 *
 * This module is intentionally zero-dependency and handles only IP literals
 * (IPv4 / IPv6), which is all that `cimd-transport.ts` needs — the caller
 * feeds it resolved `dns.lookup()` addresses, never FQDNs.
 *
 * Coverage: RFC 6890 (Special-Purpose IP Address Registries), including
 * loopback, private (RFC 1918), link-local, carrier-grade NAT (RFC 6598),
 * documentation (RFC 5737 / RFC 3849), benchmarking (RFC 2544), multicast,
 * broadcast, and tunnel/translation forms (6to4, Teredo, NAT64).
 */

// ---------------------------------------------------------------------------
// IPv4
// ---------------------------------------------------------------------------

/** Pack dotted-decimal IPv4 into a 32-bit unsigned integer. */
function ipv4ToU32(ip: string): number {
	const parts = ip.split(".");
	return (
		((Number(parts[0]) << 24) |
			(Number(parts[1]) << 16) |
			(Number(parts[2]) << 8) |
			Number(parts[3])) >>>
		0
	);
}

/** Check whether `value` falls inside `prefix/length` (CIDR). */
function inRange(value: number, prefix: number, length: number): boolean {
	if (length === 0) return true;
	const mask = length === 32 ? 0xffffffff : (~0 << (32 - length)) >>> 0;
	return (value & mask) === (prefix & mask);
}

/** Returns true when an IPv4 address is publicly routable. */
function isPublicIPv4(ip: string): boolean {
	if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) return false;
	const parts = ip.split(".");
	if (parts.some((p) => Number(p) > 255)) return false;

	const n = ipv4ToU32(ip);

	// Unspecified & broadcast
	if (ip === "0.0.0.0" || ip === "255.255.255.255") return false;

	const blocks: [string, number][] = [
		["0.0.0.0", 8], // "This host on this network" (RFC 1122)
		["10.0.0.0", 8], // Private (RFC 1918)
		["100.64.0.0", 10], // Shared / CGN (RFC 6598)
		["127.0.0.0", 8], // Loopback (RFC 1122)
		["169.254.0.0", 16], // Link-local (RFC 3927) — includes AWS IMDS
		["172.16.0.0", 12], // Private (RFC 1918)
		["192.0.0.0", 24], // IETF Protocol Assignments (RFC 6890)
		["192.0.2.0", 24], // Documentation TEST-NET-1 (RFC 5737)
		["192.88.99.0", 24], // 6to4 Relay Anycast (RFC 7526, deprecated)
		["192.168.0.0", 16], // Private (RFC 1918)
		["198.18.0.0", 15], // Benchmarking (RFC 2544)
		["198.51.100.0", 24], // Documentation TEST-NET-2 (RFC 5737)
		["203.0.113.0", 24], // Documentation TEST-NET-3 (RFC 5737)
		["224.0.0.0", 4], // Multicast (RFC 5771)
		["240.0.0.0", 4], // Reserved / Future use (RFC 1112)
	];

	for (const [prefix, len] of blocks) {
		if (inRange(n, ipv4ToU32(prefix), len)) return false;
	}

	return true;
}

// ---------------------------------------------------------------------------
// IPv6
// ---------------------------------------------------------------------------

/**
 * Expand an IPv6 address to its full 8-group colon-hex form, lowercased.
 * Handles `::` expansion and IPv4-mapped suffixes (`::ffff:192.0.2.1`).
 */
function expandIPv6(ip: string): string {
	let addr = ip.toLowerCase().replace(/%.+$/, ""); // strip zone ID

	// Handle IPv4-mapped / IPv4-compatible suffix
	const v4Suffix = addr.match(/:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
	if (v4Suffix?.[1]) {
		const parts = v4Suffix[1].split(".").map(Number);
		const hi = ((parts[0]! << 8) | parts[1]!).toString(16).padStart(4, "0");
		const lo = ((parts[2]! << 8) | parts[3]!).toString(16).padStart(4, "0");
		addr = addr.replace(v4Suffix[0], `:${hi}:${lo}`);
	}

	// Expand ::
	if (addr.includes("::")) {
		const [left, right] = addr.split("::");
		const leftGroups = left ? left.split(":") : [];
		const rightGroups = right ? right.split(":") : [];
		const missing = 8 - leftGroups.length - rightGroups.length;
		const fill = Array(missing).fill("0000") as string[];
		addr = [...leftGroups, ...fill, ...rightGroups].join(":");
	}

	return addr
		.split(":")
		.map((g) => g.padStart(4, "0"))
		.join(":");
}

/** Extract an embedded IPv4 from two consecutive 16-bit groups in expanded form. */
function extractEmbeddedIPv4(
	expanded: string,
	groupIndex: number,
	xor = false,
): string {
	const offset = groupIndex * 5;
	const g1 = Number.parseInt(expanded.slice(offset, offset + 4), 16);
	const g2 = Number.parseInt(expanded.slice(offset + 5, offset + 9), 16);
	let combined = ((g1 << 16) | g2) >>> 0;
	if (xor) combined = (combined ^ 0xffffffff) >>> 0;
	return `${(combined >>> 24) & 0xff}.${(combined >>> 16) & 0xff}.${(combined >>> 8) & 0xff}.${combined & 0xff}`;
}

/** Returns true when an IPv6 address is publicly routable. */
function isPublicIPv6(ip: string): boolean {
	const expanded = expandIPv6(ip);
	const groups = expanded.split(":");
	if (groups.length !== 8) return false;

	// Unspecified (::)
	if (expanded === "0000:0000:0000:0000:0000:0000:0000:0000") return false;
	// Loopback (::1)
	if (expanded === "0000:0000:0000:0000:0000:0000:0000:0001") return false;

	const firstByte = Number.parseInt(expanded.slice(0, 2), 16);
	const secondByte = Number.parseInt(expanded.slice(2, 4), 16);

	// IPv4-mapped (::ffff:x.x.x.x) — classify the embedded IPv4
	if (expanded.startsWith("0000:0000:0000:0000:0000:ffff:")) {
		const embedded = extractEmbeddedIPv4(expanded, 6);
		return isPublicIPv4(embedded);
	}

	// Multicast (ff00::/8)
	if (firstByte === 0xff) return false;
	// Link-local (fe80::/10)
	if (firstByte === 0xfe && (secondByte & 0xc0) === 0x80) return false;
	// Deprecated site-local (fec0::/10, RFC 3879)
	if (firstByte === 0xfe && (secondByte & 0xc0) === 0xc0) return false;
	// ULA / Private (fc00::/7)
	if ((firstByte & 0xfe) === 0xfc) return false;

	// Documentation (2001:db8::/32, RFC 3849)
	if (expanded.startsWith("2001:0db8:")) return false;
	// Benchmarking (2001:2::/48, RFC 5180)
	if (expanded.startsWith("2001:0002:0000:")) return false;
	// Documentation (3fff:0xxx::/20, RFC 9637)
	if (expanded.startsWith("3fff:0")) return false;
	// SRv6 SIDs (5f00::/16, RFC 9602)
	if (expanded.startsWith("5f00:")) return false;
	// Discard-Only (100::/64, RFC 6666)
	if (expanded.startsWith("0100:0000:0000:0000:")) return false;
	// NAT64 local-use (64:ff9b:1::/48, RFC 8215)
	if (expanded.startsWith("0064:ff9b:0001:")) return false;

	// ::/96 — deprecated IPv4-compatible (RFC 4291 §2.5.5.1)
	if (expanded.startsWith("0000:0000:0000:0000:0000:0000:")) return false;

	// 6to4 (2002::/16) — check embedded IPv4
	if (expanded.startsWith("2002:")) {
		const embedded = extractEmbeddedIPv4(expanded, 1);
		return isPublicIPv4(embedded);
	}

	// NAT64 well-known (64:ff9b::/96) — check embedded IPv4
	if (expanded.startsWith("0064:ff9b:0000:0000:0000:0000:")) {
		const embedded = extractEmbeddedIPv4(expanded, 6);
		return isPublicIPv4(embedded);
	}

	// Teredo (2001:0000::/32) — check embedded IPv4 (XORed)
	if (expanded.startsWith("2001:0000:")) {
		const embedded = extractEmbeddedIPv4(expanded, 6, true);
		return isPublicIPv4(embedded);
	}

	return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns true when the given IP address (IPv4 or IPv6 literal) is
 * publicly routable — i.e. NOT loopback, private, link-local, reserved,
 * multicast, documentation, or any other RFC 6890 special-purpose range.
 *
 * Use this before issuing server-side fetches to resolved DNS addresses
 * to prevent SSRF.
 *
 * @example
 * isPublicRoutableIP("93.184.216.34")   // true  (example.com)
 * isPublicRoutableIP("127.0.0.1")       // false (loopback)
 * isPublicRoutableIP("169.254.169.254") // false (link-local / AWS IMDS)
 * isPublicRoutableIP("10.0.0.1")        // false (private)
 * isPublicRoutableIP("::ffff:127.0.0.1") // false (mapped loopback)
 */
export function isPublicRoutableIP(ip: string): boolean {
	const trimmed = ip.trim().replace(/^\[|\]$/g, "");

	// IPv4
	if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(trimmed)) {
		return isPublicIPv4(trimmed);
	}

	// IPv6
	if (trimmed.includes(":")) {
		return isPublicIPv6(trimmed);
	}

	// Not an IP literal — fail closed
	return false;
}
