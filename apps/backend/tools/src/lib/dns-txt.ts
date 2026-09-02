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

export function findRecordsByPrefix(
	records: string[],
	prefix: string,
): string[] {
	const needle = prefix.toLowerCase();
	return records.filter((record) =>
		record.trim().toLowerCase().startsWith(needle),
	);
}
