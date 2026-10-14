import dns from "node:dns/promises";
import { withDeadline } from "@be/tools/utils/deadline";

const publicResolver = new dns.Resolver();
publicResolver.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

const DEFAULT_TIMEOUT_MS = 2000;

export type TxtLookup = (name: string) => Promise<string[]>;

export function flattenTxt(records: string[][]): string[] {
	return records.map((chunks) => chunks.join("").trim()).filter(Boolean);
}

export async function lookupTxt(
	name: string,
	timeoutMs = DEFAULT_TIMEOUT_MS,
	resolver: dns.Resolver = publicResolver,
): Promise<string[]> {
	try {
		const records = await withDeadline(
			resolver.resolveTxt(name),
			timeoutMs,
			`TXT ${name}`,
		);
		return flattenTxt(records);
	} catch {
		return [];
	}
}

export type TxtResult = { records: string[]; failed: boolean };

export type TxtResultLookup = (name: string) => Promise<TxtResult>;

// NXDOMAIN and NODATA are real answers ("nothing here"). Anything else — a
// timeout, SERVFAIL, a refused connection — means we don't know.
const NO_ANSWER_CODES = new Set(["ENOTFOUND", "ENODATA"]);

function isNoAnswer(error: unknown): boolean {
	const code = (error as NodeJS.ErrnoException | undefined)?.code;
	return Boolean(code && NO_ANSWER_CODES.has(code));
}

export async function lookupTxtResult(
	name: string,
	timeoutMs = DEFAULT_TIMEOUT_MS,
	resolver: dns.Resolver = publicResolver,
): Promise<TxtResult> {
	try {
		const records = await withDeadline(
			resolver.resolveTxt(name),
			timeoutMs,
			`TXT ${name}`,
		);
		return { records: flattenTxt(records), failed: false };
	} catch (error) {
		return { records: [], failed: !isNoAnswer(error) };
	}
}

/** true/false when DNS answered, null when the lookup itself failed. */
export async function domainExists(
	domain: string,
	timeoutMs = DEFAULT_TIMEOUT_MS,
	resolver: dns.Resolver = publicResolver,
): Promise<boolean | null> {
	try {
		await withDeadline(resolver.resolveSoa(domain), timeoutMs, `SOA ${domain}`);
		return true;
	} catch (error) {
		const code = (error as NodeJS.ErrnoException | undefined)?.code;
		if (code === "ENODATA") return true;
		if (code === "ENOTFOUND") return false;
		return null;
	}
}

export function findRecordsByPrefix(
	records: string[],
	prefix: string,
): string[] {
	const needle = prefix.toLowerCase();
	return records.filter((record) =>
		record.trim().toLowerCase().startsWith(needle),
	);
}
