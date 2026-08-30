import {
	type DnsLookupResult,
	type DnsRecordType,
	performDnsLookup,
} from "./dns-lookup.service";

export async function dnsLookupController(
	domainOrQuery: string,
	typeOverride?: DnsRecordType,
): Promise<DnsLookupResult> {
	const input = (domainOrQuery || "").trim();
	if (!input) {
		throw new Error("Domain name, IP address, or query prefix is required.");
	}

	if (input.length > 255) {
		throw new Error("Target exceeds maximum allowed length of 255 characters.");
	}

	return await performDnsLookup(input, typeOverride);
}
