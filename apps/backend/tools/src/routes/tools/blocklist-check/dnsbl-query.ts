import dns from "node:dns/promises";
import net from "node:net";
import { withDeadline } from "@be/tools/utils/deadline";
import type { DnsblProvider } from "./dnsbl-providers";

export type ListingStatus = "listed" | "not_listed" | "error" | "skipped";

export interface ListingEvaluation {
	status: ListingStatus;
	validCodes: string[];
	error?: string;
}

export interface DnsblItemResult {
	id: string;
	name: string;
	host: string;
	listType: "ip" | "domain";
	category: DnsblProvider["category"];
	impact: DnsblProvider["impact"];
	status: ListingStatus;
	isListed: boolean;
	responseCodes: string[];
	responseTimeMs: number;
	delistUrl: string;
	description: string;
	listedTargets: string[];
	txtRecord?: string;
	error?: string;
}

/** System resolver — DNSBL zones (especially Spamhaus) refuse 1.1.1.1 / 8.8.8.8. */
const dnsblResolver = new dns.Resolver();

const RFC_ERROR_PREFIX = "127.255.255.";
const QUERY_TIMEOUT_MS = 2500;
const TXT_TIMEOUT_MS = 1200;

export function isRfc5782ErrorCode(code: string): boolean {
	if (code.startsWith(RFC_ERROR_PREFIX)) return true;
	if (code === "127.0.0.255") return true;
	return false;
}

export function isLoopbackARecord(code: string): boolean {
	return code.startsWith("127.");
}

/**
 * Reverses an IPv4 address for DNSBL querying.
 * Example: "192.0.2.1" -> "1.2.0.192"
 */
export function reverseIpv4(ip: string): string {
	const parts = ip.split(".");
	if (parts.length !== 4) return ip;
	return [...parts].reverse().join(".");
}

/**
 * Expands IPv6 to eight 4-hex-digit groups. Zone IDs (%eth0) are stripped.
 */
export function expandIpv6(ip: string): string {
	let bare = (ip.split("%")[0] || ip).trim();
	const v4mapped = bare.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
	if (v4mapped) {
		const dotted = v4mapped[2] ?? "0.0.0.0";
		const octets = dotted.split(".").map((octet) => Number.parseInt(octet, 10));
		const hi = (((octets[0] ?? 0) << 8) | (octets[1] ?? 0)).toString(16);
		const lo = (((octets[2] ?? 0) << 8) | (octets[3] ?? 0)).toString(16);
		bare = `${v4mapped[1]}${hi}:${lo}`;
	}

	const [head, tail] = bare.split("::");
	const headParts = head ? head.split(":").filter(Boolean) : [];
	const tailParts = tail ? tail.split(":").filter(Boolean) : [];
	const missing = Math.max(0, 8 - headParts.length - tailParts.length);
	const parts = [...headParts, ...Array(missing).fill("0"), ...tailParts];
	return parts
		.slice(0, 8)
		.map((part) => part.padStart(4, "0"))
		.join(":");
}

/**
 * Nibble-reversed IPv6 for DNSBL querying (RFC 5782).
 * Example: "2001:db8::1" -> "1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2"
 */
export function reverseIpv6(ip: string): string {
	const expanded = expandIpv6(ip);
	const nibbles = expanded.replace(/:/g, "").split("");
	return nibbles.reverse().join(".");
}

export function reverseIpForDnsbl(ip: string): string {
	if (net.isIPv4(ip)) return reverseIpv4(ip);
	if (net.isIPv6(ip)) return reverseIpv6(ip);
	return ip;
}

/**
 * Interprets DNSBL A records per RFC 5782.
 * 127.0.0.1 is never a listing. 127.255.255.x is a query error, not a hit.
 * Addresses outside 127.0.0.0/8 are treated as resolver hijacking.
 */
export function evaluateListingStatus(
	addresses: string[] | null | undefined,
): ListingEvaluation {
	if (!addresses || addresses.length === 0) {
		return { status: "not_listed", validCodes: [] };
	}

	const errorCodes = addresses.filter((code) => isRfc5782ErrorCode(code));
	if (errorCodes.length === addresses.length) {
		const refused = errorCodes.some((code) => code === "127.255.255.254");
		return {
			status: "error",
			validCodes: [],
			error: refused
				? "Query refused (127.255.255.254). This list blocked the resolver — not a clean result."
				: "List returned an RFC 5782 error code — not a listing.",
		};
	}

	const hijacked = addresses.filter((code) => !isLoopbackARecord(code));
	if (hijacked.length === addresses.length) {
		return {
			status: "error",
			validCodes: [],
			error:
				"Resolver returned a non-127.0.0.0/8 address (possible NXDOMAIN hijack).",
		};
	}

	const listedCodes = addresses.filter((code) => {
		if (isRfc5782ErrorCode(code)) return false;
		if (!isLoopbackARecord(code)) return false;
		if (code === "127.0.0.1") return false;
		return true;
	});

	if (listedCodes.length > 0) {
		return { status: "listed", validCodes: listedCodes };
	}

	return { status: "not_listed", validCodes: [] };
}

function isNxdomain(error: unknown): boolean {
	const code = (error as { code?: string })?.code;
	return code === "ENOTFOUND" || code === "ENODATA" || code === "ENOTIMP";
}

export async function querySingleDnsbl(options: {
	queryName: string;
	targetLabel: string;
	provider: DnsblProvider;
	resolver?: dns.Resolver;
}): Promise<DnsblItemResult> {
	const { queryName, targetLabel, provider } = options;
	const resolver = options.resolver ?? dnsblResolver;
	const start = Date.now();

	try {
		const addresses = await withDeadline(
			resolver.resolve4(queryName),
			QUERY_TIMEOUT_MS,
			`${provider.name} DNSBL`,
		);
		const elapsed = Date.now() - start;
		const evaluation = evaluateListingStatus(addresses);

		let txtRecord: string | undefined;
		if (evaluation.status === "listed") {
			try {
				const txts = await withDeadline(
					resolver.resolveTxt(queryName),
					TXT_TIMEOUT_MS,
					`${provider.name} TXT`,
				);
				if (txts && txts.length > 0) {
					txtRecord = txts.flat().join(" ").trim();
				}
			} catch {
				// TXT is optional
			}
		}

		return {
			id: provider.id,
			name: provider.name,
			host: provider.host,
			listType: provider.listType,
			category: provider.category,
			impact: provider.impact,
			status: evaluation.status,
			isListed: evaluation.status === "listed",
			responseCodes: evaluation.validCodes,
			responseTimeMs: elapsed,
			delistUrl: provider.delistUrl,
			description: provider.description,
			listedTargets: evaluation.status === "listed" ? [targetLabel] : [],
			txtRecord,
			error: evaluation.error,
		};
	} catch (error) {
		const elapsed = Date.now() - start;
		if (isNxdomain(error)) {
			return {
				id: provider.id,
				name: provider.name,
				host: provider.host,
				listType: provider.listType,
				category: provider.category,
				impact: provider.impact,
				status: "not_listed",
				isListed: false,
				responseCodes: [],
				responseTimeMs: elapsed,
				delistUrl: provider.delistUrl,
				description: provider.description,
				listedTargets: [],
			};
		}

		const message =
			error instanceof Error ? error.message : "DNSBL query failed";

		return {
			id: provider.id,
			name: provider.name,
			host: provider.host,
			listType: provider.listType,
			category: provider.category,
			impact: provider.impact,
			status: "error",
			isListed: false,
			responseCodes: [],
			responseTimeMs: elapsed,
			delistUrl: provider.delistUrl,
			description: provider.description,
			listedTargets: [],
			error: message,
		};
	}
}

export function skippedResult(
	provider: DnsblProvider,
	reason: string,
): DnsblItemResult {
	return {
		id: provider.id,
		name: provider.name,
		host: provider.host,
		listType: provider.listType,
		category: provider.category,
		impact: provider.impact,
		status: "skipped",
		isListed: false,
		responseCodes: [],
		responseTimeMs: 0,
		delistUrl: provider.delistUrl,
		description: provider.description,
		listedTargets: [],
		error: reason,
	};
}

export function mergeIpListResults(
	provider: DnsblProvider,
	parts: DnsblItemResult[],
): DnsblItemResult {
	if (parts.length === 0) {
		return skippedResult(provider, "No IP addresses to query.");
	}

	const listed = parts.filter((part) => part.status === "listed");
	const firstListed = listed[0];
	if (firstListed) {
		const slowest = Math.max(...parts.map((part) => part.responseTimeMs));
		return {
			...firstListed,
			responseTimeMs: slowest,
			listedTargets: listed.flatMap((part) => part.listedTargets),
			responseCodes: [...new Set(listed.flatMap((part) => part.responseCodes))],
			txtRecord: listed
				.map((part) => part.txtRecord)
				.filter(Boolean)
				.join(" "),
		};
	}

	const answered = parts.filter((part) => part.status === "not_listed");
	const firstAnswered = answered[0];
	if (firstAnswered) {
		const failed = parts.filter((part) => part.status === "error");
		const slowest = Math.max(...parts.map((part) => part.responseTimeMs));
		return {
			...firstAnswered,
			responseTimeMs: slowest,
			error:
				failed.length > 0
					? `${failed.length} of ${parts.length} IP queries failed; none of the successful queries were listed.`
					: undefined,
		};
	}

	if (parts.every((part) => part.status === "skipped")) {
		return skippedResult(provider, parts[0]?.error || "Skipped.");
	}

	const firstPart = parts[0];
	if (!firstPart) {
		return skippedResult(provider, "No IP addresses to query.");
	}
	const slowest = Math.max(...parts.map((part) => part.responseTimeMs));
	return {
		...firstPart,
		status: "error",
		isListed: false,
		responseTimeMs: slowest,
		error: parts.find((part) => part.error)?.error || "All IP queries failed.",
	};
}

export type BlocklistVerdict = "clean" | "listed" | "inconclusive";

export function aggregateVerdict(results: DnsblItemResult[]): {
	verdict: BlocklistVerdict;
	isClean: boolean;
	listedCount: number;
	cleanCount: number;
	errorCount: number;
	skippedCount: number;
} {
	const listedCount = results.filter((item) => item.status === "listed").length;
	const cleanCount = results.filter(
		(item) => item.status === "not_listed",
	).length;
	const errorCount = results.filter((item) => item.status === "error").length;
	const skippedCount = results.filter(
		(item) => item.status === "skipped",
	).length;

	const highImpact = results.filter((item) => item.impact === "high");
	const highImpactAnswered = highImpact.filter(
		(item) => item.status === "listed" || item.status === "not_listed",
	);
	const highImpactErrors = highImpact.filter((item) => item.status === "error");

	let verdict: BlocklistVerdict;
	if (listedCount > 0) {
		verdict = "listed";
	} else if (highImpactErrors.length > 0 || highImpactAnswered.length === 0) {
		verdict = "inconclusive";
	} else {
		verdict = "clean";
	}

	return {
		verdict,
		isClean: verdict === "clean",
		listedCount,
		cleanCount,
		errorCount,
		skippedCount,
	};
}
