import net from "node:net";
import { ToolsErrors } from "@be/tools/error/tools.error-response";
import { findRecordsByPrefix, type TxtLookup } from "@be/tools/lib/dns-txt";
import { isPlausibleDomain, normalizeDomain } from "@be/tools/lib/domain";

export type SpfPolicy = "~all" | "-all" | "?all" | "+all";

export type SpfGenerateInput = {
	domain: string;
	ipv4?: string[];
	ipv6?: string[];
	includes?: string[];
	a?: boolean;
	mx?: boolean;
	aHosts?: string[];
	mxHosts?: string[];
	policy?: SpfPolicy;
};

export type RecordWarning = {
	severity: "warn" | "fail";
	code: string;
	detail: string;
	fix: string;
};

export type SpfGenerateResult = {
	domain: string;
	dnsName: string;
	record: string;
	lookupCount: number;
	lookupLimit: number;
	policy: SpfPolicy;
	existingRecord: string | null;
	warnings: RecordWarning[];
};

const LOOKUP_LIMIT = 10;
const MAX_MECHANISMS = 20;

function cleanList(values: string[] | undefined, cap: number): string[] {
	if (!values) return [];
	const out: string[] = [];
	const seen = new Set<string>();
	for (const raw of values) {
		const value = raw.trim().toLowerCase().replace(/\.$/, "");
		if (!value || seen.has(value)) continue;
		seen.add(value);
		out.push(value);
		if (out.length >= cap) break;
	}
	return out;
}

function isValidInclude(domain: string): boolean {
	return isPlausibleDomain(domain);
}

export function countSpfLookups(parts: string[]): number {
	let count = 0;
	for (const part of parts) {
		if (
			part === "a" ||
			part === "mx" ||
			part === "ptr" ||
			part.startsWith("a:") ||
			part.startsWith("mx:") ||
			part.startsWith("include:") ||
			part.startsWith("exists:") ||
			part.startsWith("redirect=")
		) {
			count += 1;
		}
	}
	return count;
}

export function buildSpfRecord(input: SpfGenerateInput): {
	domain: string;
	parts: string[];
	policy: SpfPolicy;
	warnings: RecordWarning[];
} {
	const domain = normalizeDomain(input.domain);
	if (!domain) throw ToolsErrors.generatorEmptyDomain();
	if (!isPlausibleDomain(domain)) throw ToolsErrors.generatorInvalidDomain();

	const policy = input.policy ?? "~all";
	const ipv4 = cleanList(input.ipv4, MAX_MECHANISMS);
	const ipv6 = cleanList(input.ipv6, MAX_MECHANISMS);
	const includes = cleanList(input.includes, MAX_MECHANISMS);
	const aHosts = cleanList(input.aHosts, MAX_MECHANISMS);
	const mxHosts = cleanList(input.mxHosts, MAX_MECHANISMS);

	const warnings: RecordWarning[] = [];
	const parts: string[] = ["v=spf1"];

	for (const ip of ipv4) {
		if (!net.isIPv4(ip)) {
			warnings.push({
				severity: "fail",
				code: "bad-ipv4",
				detail: `"${ip}" is not a valid IPv4 address.`,
				fix: "Use dotted-quad IPv4 addresses such as 203.0.113.10.",
			});
			continue;
		}
		parts.push(`ip4:${ip}`);
	}

	for (const ip of ipv6) {
		if (!net.isIPv6(ip)) {
			warnings.push({
				severity: "fail",
				code: "bad-ipv6",
				detail: `"${ip}" is not a valid IPv6 address.`,
				fix: "Use a compressed or expanded IPv6 address.",
			});
			continue;
		}
		parts.push(`ip6:${ip}`);
	}

	if (input.a) parts.push("a");
	for (const host of aHosts) {
		if (!isValidInclude(host)) {
			warnings.push({
				severity: "fail",
				code: "bad-a-host",
				detail: `"${host}" is not a valid hostname for a:.`,
				fix: "Use a fully-qualified domain name.",
			});
			continue;
		}
		parts.push(`a:${host}`);
	}

	if (input.mx) parts.push("mx");
	for (const host of mxHosts) {
		if (!isValidInclude(host)) {
			warnings.push({
				severity: "fail",
				code: "bad-mx-host",
				detail: `"${host}" is not a valid hostname for mx:.`,
				fix: "Use a fully-qualified domain name.",
			});
			continue;
		}
		parts.push(`mx:${host}`);
	}

	for (const include of includes) {
		if (!isValidInclude(include)) {
			warnings.push({
				severity: "fail",
				code: "bad-include",
				detail: `"${include}" is not a valid include: domain.`,
				fix: "Use the SPF include hostname your ESP published, e.g. include:spf.reloop.sh.",
			});
			continue;
		}
		parts.push(`include:${include}`);
	}

	if (policy === "+all") {
		warnings.push({
			severity: "fail",
			code: "plus-all",
			detail:
				"+all authorizes every host on the internet to send as this domain.",
			fix: "Use -all (fail) or ~all (softfail) after you have listed every sender.",
		});
	}

	const lookupCount = countSpfLookups([...parts, policy]);
	if (lookupCount > LOOKUP_LIMIT) {
		warnings.push({
			severity: "fail",
			code: "lookup-limit",
			detail: `This record causes ${lookupCount} DNS lookups. SPF allows at most ${LOOKUP_LIMIT}.`,
			fix: "Remove include:/a/mx/ptr/exists mechanisms, or flatten vendor IPs carefully.",
		});
	} else if (lookupCount >= 8) {
		warnings.push({
			severity: "warn",
			code: "lookup-near-limit",
			detail: `This record uses ${lookupCount} of ${LOOKUP_LIMIT} DNS lookups. Nested includes count too.`,
			fix: "Leave headroom. Each include: can hide several more lookups.",
		});
	}

	const authorized = parts.length > 1;
	if (!authorized) {
		warnings.push({
			severity: "warn",
			code: "empty-spf",
			detail: "The record has no ip4/ip6/include/a/mx mechanisms.",
			fix: "Add your sending IPs or ESP include: before publishing.",
		});
	}

	parts.push(policy);

	return { domain, parts, policy, warnings };
}

export function generateSpfRecord(input: SpfGenerateInput): SpfGenerateResult {
	const built = buildSpfRecord(input);
	const record = built.parts.join(" ");
	const lookupCount = countSpfLookups(built.parts);
	const warnings = [...built.warnings];
	if (
		built.parts.some(
			(part) => part.startsWith("include:") || part.startsWith("redirect="),
		)
	) {
		warnings.push({
			severity: "warn",
			code: "nested-lookups-unexpanded",
			detail: `lookupCount (${lookupCount}) is a lower bound until nested include:/redirect= records are resolved.`,
			fix: "Each include: can add more DNS lookups. Reloop expands published includes after generation.",
		});
	}

	return {
		domain: built.domain,
		dnsName: built.domain,
		record,
		lookupCount,
		lookupLimit: LOOKUP_LIMIT,
		policy: built.policy,
		existingRecord: null,
		warnings,
	};
}

export async function attachExistingSpf(
	result: SpfGenerateResult,
	lookup: TxtLookup,
): Promise<SpfGenerateResult> {
	const txts = await lookup(result.domain);
	const existing = findRecordsByPrefix(txts, "v=spf1");
	if (existing.length === 0) return result;

	const warnings = [...result.warnings];
	if (existing.length > 1) {
		warnings.push({
			severity: "fail",
			code: "duplicate-spf",
			detail: `This domain already publishes ${existing.length} SPF TXT records. Multiple SPF records are invalid.`,
			fix: "Merge senders into a single v=spf1 record and delete the extras.",
		});
	} else {
		warnings.push({
			severity: "warn",
			code: "existing-spf",
			detail: `An SPF record already exists: ${existing[0]}`,
			fix: "Replace that record with the generated one — do not publish a second v=spf1 TXT.",
		});
	}

	return {
		...result,
		existingRecord: existing[0] ?? null,
		warnings,
	};
}

const EXPAND_DEADLINE_MS = 2500;
const EXPAND_MAX_DEPTH = 10;

function lookupTermsFromRecord(record: string): string[] {
	return record.split(/\s+/).filter(Boolean);
}

export async function expandSpfLookups(
	result: SpfGenerateResult,
	lookup: TxtLookup,
): Promise<SpfGenerateResult> {
	const deadline = Date.now() + EXPAND_DEADLINE_MS;
	const visited = new Set<string>();
	let incomplete = false;

	const walk = async (parts: string[], depth: number): Promise<number> => {
		let count = countSpfLookups(parts);
		if (depth >= EXPAND_MAX_DEPTH || Date.now() > deadline) {
			incomplete = true;
			return count;
		}

		for (const part of parts) {
			let nestedDomain: string | null = null;
			if (part.startsWith("include:"))
				nestedDomain = part.slice("include:".length);
			else if (part.startsWith("redirect=")) {
				nestedDomain = part.slice("redirect=".length);
			}
			if (!nestedDomain || !isPlausibleDomain(nestedDomain)) continue;
			if (visited.has(nestedDomain)) continue;
			visited.add(nestedDomain);
			if (Date.now() > deadline) {
				incomplete = true;
				break;
			}
			const txts = await lookup(nestedDomain);
			const nested = findRecordsByPrefix(txts, "v=spf1");
			if (nested.length === 0) {
				incomplete = true;
				continue;
			}
			count += await walk(lookupTermsFromRecord(nested[0] ?? ""), depth + 1);
		}
		return count;
	};

	const lookupCount = await walk(lookupTermsFromRecord(result.record), 0);
	const warnings = result.warnings.filter(
		(warning) =>
			warning.code !== "lookup-limit" &&
			warning.code !== "lookup-near-limit" &&
			warning.code !== "nested-lookups-unexpanded",
	);

	if (lookupCount > LOOKUP_LIMIT) {
		warnings.push({
			severity: "fail",
			code: "lookup-limit",
			detail: `This record causes ${lookupCount} DNS lookups after expanding include: targets. SPF allows at most ${LOOKUP_LIMIT}.`,
			fix: "Remove include:/a/mx/ptr/exists mechanisms, or flatten vendor IPs carefully.",
		});
	} else if (lookupCount >= 8) {
		warnings.push({
			severity: "warn",
			code: "lookup-near-limit",
			detail: `This record uses ${lookupCount} of ${LOOKUP_LIMIT} DNS lookups, including nested includes.`,
			fix: "Leave headroom. Each include: can hide several more lookups.",
		});
	}

	if (incomplete) {
		warnings.push({
			severity: "warn",
			code: "nested-lookups-unexpanded",
			detail: `lookupCount (${lookupCount}) is a lower bound. Some include: targets could not be fully expanded.`,
			fix: "Publish fewer nested includes, or confirm each include: hostname answers with a single v=spf1 record.",
		});
	}

	return { ...result, lookupCount, warnings };
}
