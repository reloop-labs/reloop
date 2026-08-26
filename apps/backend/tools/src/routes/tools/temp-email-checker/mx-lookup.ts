import dns from "node:dns/promises";
import { withDeadline } from "@be/tools/utils/deadline";

const publicResolver = new dns.Resolver();
publicResolver.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

const MX_TIMEOUT_MS = 1500;
const MX_RECORD_CAP = 20;

const EMPTY_MX_CODES = new Set(["ENODATA", "ENOTFOUND", "ENOTIMP"]);

export type MxLookupResult =
	| { status: "ok"; records: string[] }
	| { status: "empty"; records: [] }
	| { status: "error"; records: [] };

export type MxRecord = {
	exchange: string;
	priority: number;
};

export function normalizeMxRecords(records: MxRecord[]): string[] {
	const sorted = [...records].sort((a, b) => {
		if (a.priority !== b.priority) return a.priority - b.priority;
		return a.exchange.localeCompare(b.exchange);
	});

	const hosts: string[] = [];
	const seen = new Set<string>();

	for (const record of sorted) {
		const host = record.exchange.replace(/\.$/, "").toLowerCase();
		if (!host || seen.has(host)) continue;
		seen.add(host);
		hosts.push(host);
		if (hosts.length >= MX_RECORD_CAP) break;
	}

	return hosts;
}

export function isEmptyMxError(error: unknown): boolean {
	if (!error || typeof error !== "object" || !("code" in error)) return false;
	return EMPTY_MX_CODES.has(String(error.code));
}

export async function lookupMxRecords(domain: string): Promise<MxLookupResult> {
	try {
		const records = await withDeadline(
			publicResolver.resolveMx(domain),
			MX_TIMEOUT_MS,
			"MX",
		);
		const hosts = normalizeMxRecords(records);
		if (hosts.length === 0) return { status: "empty", records: [] };
		return { status: "ok", records: hosts };
	} catch (error) {
		if (isEmptyMxError(error)) return { status: "empty", records: [] };
		return { status: "error", records: [] };
	}
}

export async function checkImplicitMx(domain: string): Promise<boolean> {
	try {
		const ips = await withDeadline(publicResolver.resolve4(domain), 1000, "A");
		return Array.isArray(ips) && ips.length > 0;
	} catch {
		return false;
	}
}

export function detectSmtpProvider(mxRecords: string[]): string | null {
	if (mxRecords.length === 0) return null;
	const joined = mxRecords.join(" ").toLowerCase();
	if (
		joined.includes("google") ||
		joined.includes("googlemail") ||
		joined.includes("aspmx")
	) {
		return "Google Workspace";
	}
	if (
		joined.includes("outlook") ||
		joined.includes("microsoft") ||
		joined.includes("office365")
	) {
		return "Microsoft 365";
	}
	if (joined.includes("protonmail") || joined.includes("proton.me")) {
		return "Proton Mail";
	}
	if (joined.includes("zoho")) {
		return "Zoho Mail";
	}
	if (joined.includes("icloud") || joined.includes("apple")) {
		return "Apple iCloud";
	}
	if (joined.includes("yahoo") || joined.includes("yahoodns")) {
		return "Yahoo Mail";
	}
	if (joined.includes("fastmail")) {
		return "Fastmail";
	}
	if (joined.includes("inbound.reloop.sh")) {
		return "Reloop";
	}
	return null;
}
