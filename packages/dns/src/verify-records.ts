import { isLocal } from "./is-local";
import { resolver } from "./resolver";

export type DnsCheckOutcome = "match" | "mismatch" | "lookup_failed";

export type TxtLookup = (name: string) => Promise<string[][]>;
export type MxLookup = (
	name: string,
) => Promise<{ exchange: string; priority: number }[]>;
export type CnameLookup = (name: string) => Promise<string[]>;
export type AddressLookup = (name: string) => Promise<string[]>;

const MISSING_CODES = new Set(["ENOTFOUND", "ENODATA", "ENONAME"]);

export function classifyDnsError(error: unknown): "mismatch" | "lookup_failed" {
	const code =
		typeof error === "object" && error !== null && "code" in error
			? String((error as { code?: unknown }).code ?? "")
			: "";
	if (MISSING_CODES.has(code)) return "mismatch";
	return "lookup_failed";
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			reject(
				Object.assign(new Error("DNS query timeout"), { code: "ETIMEOUT" }),
			);
		}, ms);
		promise.then(
			(value) => {
				clearTimeout(timer);
				resolve(value);
			},
			(error: unknown) => {
				clearTimeout(timer);
				reject(error);
			},
		);
	});
}

async function defaultTxt(name: string): Promise<string[][]> {
	return withTimeout(resolver.resolveTxt(name), 10_000);
}

async function defaultMx(
	name: string,
): Promise<{ exchange: string; priority: number }[]> {
	return withTimeout(resolver.resolveMx(name), 10_000);
}

async function defaultCname(name: string): Promise<string[]> {
	return withTimeout(resolver.resolveCname(name), 10_000);
}

async function defaultAddresses(name: string): Promise<string[]> {
	const [v4, v6] = await Promise.all([
		withTimeout(resolver.resolve4(name), 5_000).catch(() => [] as string[]),
		withTimeout(resolver.resolve6(name), 5_000).catch(() => [] as string[]),
	]);
	return [...v4, ...v6];
}

export function spfRecordMatches(
	flattenedRecords: string[],
	expectedValue: string,
): boolean {
	const requiredIncludes = expectedValue
		.trim()
		.split(/\s+/)
		.filter((part) => part.startsWith("include:"));

	return flattenedRecords.some((record) => {
		const normalizedRecord = record.trim().replace(/\s+/g, " ");
		if (!normalizedRecord.startsWith("v=spf1")) return false;
		return requiredIncludes.every((inc) => normalizedRecord.includes(inc));
	});
}

export function dkimRecordMatches(
	combinedRecord: string,
	expectedValue: string,
): boolean {
	const expectedPublicKeyMatch = expectedValue.match(/p=([^;]+)/);
	if (!expectedPublicKeyMatch?.[1]) {
		return combinedRecord.includes(expectedValue.trim());
	}
	const expectedPublicKey = expectedPublicKeyMatch[1].trim();
	const actualPublicKeyMatch = combinedRecord.match(/p=([^;]+)/);
	if (!actualPublicKeyMatch?.[1]) return false;
	return actualPublicKeyMatch[1].trim() === expectedPublicKey;
}

export function dmarcRecordMatches(
	combinedRecord: string,
	expectedValue: string,
): boolean {
	const normalizedRecord = combinedRecord.replace(/\s+/g, " ").trim();
	const normalizedValue = expectedValue.replace(/\s+/g, " ").trim();
	const expectedTags = normalizedValue.split(";").map((tag) => tag.trim());
	const actualTags = normalizedRecord.split(";").map((tag) => tag.trim());

	return expectedTags.every((expectedTag) => {
		if (!expectedTag) return true;
		return actualTags.some(
			(actualTag) =>
				actualTag.toLowerCase() === expectedTag.toLowerCase() ||
				actualTag
					.toLowerCase()
					.startsWith(`${expectedTag.toLowerCase().split("=")[0]}=`),
		);
	});
}

/** Normalize stored FQDN / name for DNS lookup (apex may be stored as `@`). */
export function normalizeMxLookupName(name: string): string {
	const trimmed = name.trim().replace(/\.$/, "");
	if (trimmed === "@" || trimmed === "") return trimmed;
	if (trimmed.startsWith("@.")) return trimmed.slice(2);
	return trimmed;
}

export function mxRecordMatches(
	records: { exchange: string; priority: number }[],
	expectedValue: string,
	priority: number,
): boolean {
	const expected = expectedValue.toLowerCase().replace(/\.$/, "");
	const expectedPriority = Number(priority);
	return records.some((mx) => {
		const exchange = mx.exchange.toLowerCase().replace(/\.$/, "");
		return exchange === expected && Number(mx.priority) === expectedPriority;
	});
}

export async function checkSpfRecord(
	name: string,
	value: string,
	resolveTxt: TxtLookup = defaultTxt,
): Promise<DnsCheckOutcome> {
	if (isLocal(name)) return "match";
	try {
		const records = await resolveTxt(name);
		return spfRecordMatches(records.flat(), value) ? "match" : "mismatch";
	} catch (error) {
		console.error(`Error verifying SPF record for ${name}:`, error);
		return classifyDnsError(error);
	}
}

export async function checkDkimRecord(
	name: string,
	value: string,
	resolveTxt: TxtLookup = defaultTxt,
): Promise<DnsCheckOutcome> {
	if (isLocal(name)) return "match";
	try {
		const records = await resolveTxt(name);
		const combinedRecord = records.flat().join("");
		return dkimRecordMatches(combinedRecord, value) ? "match" : "mismatch";
	} catch (error) {
		console.error(`Error verifying DKIM record for ${name}:`, error);
		return classifyDnsError(error);
	}
}

export async function checkDmarcRecord(
	name: string,
	value: string,
	resolveTxt: TxtLookup = defaultTxt,
): Promise<DnsCheckOutcome> {
	if (isLocal(name)) return "match";
	try {
		const records = await resolveTxt(name);
		const combinedRecord = records.flat().join("");
		return dmarcRecordMatches(combinedRecord, value) ? "match" : "mismatch";
	} catch (error) {
		console.error(`Error verifying DMARC record for ${name}:`, error);
		return classifyDnsError(error);
	}
}

export async function checkMxRecord(
	name: string,
	value: string,
	priority: number,
	resolveMx: MxLookup = defaultMx,
): Promise<DnsCheckOutcome> {
	const lookupName = normalizeMxLookupName(name);
	if (!lookupName || lookupName === "@") {
		console.error(`Invalid MX lookup name: ${name}`);
		return "mismatch";
	}
	if (isLocal(lookupName)) return "match";
	try {
		const records = await resolveMx(lookupName);
		return mxRecordMatches(records, value, priority) ? "match" : "mismatch";
	} catch (error) {
		console.error(`Error verifying MX record for ${lookupName}:`, error);
		return classifyDnsError(error);
	}
}

export async function checkCnameRecord(
	name: string,
	value: string,
	lookups: {
		resolveCname?: CnameLookup;
		resolveAddresses?: AddressLookup;
	} = {},
): Promise<DnsCheckOutcome> {
	if (isLocal(name)) return "match";

	const resolveCname = lookups.resolveCname ?? defaultCname;
	const resolveAddresses = lookups.resolveAddresses ?? defaultAddresses;
	const expected = value.toLowerCase().replace(/\.$/, "");
	const cleanName = name.toLowerCase().replace(/\.$/, "");

	let directFailedLookup = false;
	try {
		let currentName = cleanName;
		const visited = new Set<string>();
		while (true) {
			const currentCleanName = currentName.toLowerCase().replace(/\.$/, "");
			if (visited.has(currentCleanName)) break;
			visited.add(currentCleanName);

			const records = await resolveCname(currentCleanName);
			if (!records || records.length === 0) break;

			let nextName: string | null = null;
			for (const cname of records) {
				const actual = cname.toLowerCase().replace(/\.$/, "");
				if (actual === expected) return "match";
				nextName = cname;
			}
			if (!nextName) break;
			currentName = nextName;
		}
	} catch (error) {
		directFailedLookup = classifyDnsError(error) === "lookup_failed";
		console.warn(
			`Direct CNAME resolution failed or not matched for ${name}:`,
			error,
		);
	}

	let addressLookupFailed = false;
	try {
		const [nameIps, valueIps] = await Promise.all([
			resolveAddresses(cleanName),
			resolveAddresses(expected),
		]);
		if (
			nameIps.length > 0 &&
			valueIps.length > 0 &&
			nameIps.some((ip) => valueIps.includes(ip))
		) {
			return "match";
		}
		if (nameIps.length === 0 && valueIps.length === 0) {
			addressLookupFailed = true;
		}
	} catch (error) {
		addressLookupFailed = classifyDnsError(error) === "lookup_failed";
		console.error(`Error during IP fallback verification for ${name}:`, error);
	}

	if (directFailedLookup && addressLookupFailed) return "lookup_failed";
	return "mismatch";
}

export async function verifySpfRecord(
	name: string,
	value: string,
): Promise<boolean> {
	return (await checkSpfRecord(name, value)) === "match";
}

export async function verifyDkimRecord(
	name: string,
	value: string,
): Promise<boolean> {
	return (await checkDkimRecord(name, value)) === "match";
}

export async function verifyDmarcRecord(
	name: string,
	value: string,
): Promise<boolean> {
	return (await checkDmarcRecord(name, value)) === "match";
}

export async function verifyMxRecord(
	name: string,
	value: string,
	priority: number,
): Promise<boolean> {
	return (await checkMxRecord(name, value, priority)) === "match";
}

export async function verifyCnameRecord(
	name: string,
	value: string,
): Promise<boolean> {
	return (await checkCnameRecord(name, value)) === "match";
}
