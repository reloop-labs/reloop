export type DnsRecordType =
	| "ANY"
	| "A"
	| "AAAA"
	| "MX"
	| "TXT"
	| "CNAME"
	| "NS"
	| "SOA"
	| "CAA"
	| "PTR"
	| "SRV";

export interface FormattedDnsRecord {
	type: string;
	name: string;
	value: string;
	ttl: number | null;
	priority?: number;
	details?: Record<string, unknown>;
}

export interface DnsDiagnosticCheck {
	id: string;
	name: string;
	category: "dns" | "email_auth" | "security" | "web";
	status: "pass" | "warn" | "fail" | "info";
	message: string;
	details?: string;
}

export interface DnsProviderInfo {
	id: string;
	name: string;
	website: string;
	category: "managed_dns" | "cloud" | "registrar" | "cdn" | "hosting";
	description: string;
}

export interface DnsLookupResponse {
	query: string;
	domain: string;
	recordType: string;
	resolvedAt: string;
	responseTimeMs: number;
	nameserver: string | null;
	provider: DnsProviderInfo | null;
	records: FormattedDnsRecord[];
	diagnostics: DnsDiagnosticCheck[];
	summary: {
		totalRecords: number;
		hasA: boolean;
		hasAaaa: boolean;
		hasMx: boolean;
		hasTxt: boolean;
		hasCname: boolean;
		hasNs: boolean;
		hasSoa: boolean;
		hasDmarc: boolean;
		hasSpf: boolean;
		dmarcPolicy: string | null;
		spfRecord: string | null;
	};
}

const BASE_URL = (process.env.NEXT_PUBLIC_URL || "").trim().replace(/\/$/, "");
const DNS_LOOKUP_URL = `${BASE_URL}/api/tools/v1/dns-lookup`;

export class DnsLookupRequestError extends Error {
	constructor(
		message: string,
		readonly status?: number,
	) {
		super(message);
		this.name = "DnsLookupRequestError";
	}
}

export async function runDnsLookup(
	domain: string,
	recordType?: DnsRecordType,
	signal?: AbortSignal,
): Promise<DnsLookupResponse> {
	let response: Response;

	try {
		response = await fetch(DNS_LOOKUP_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				domain,
				recordType: recordType && recordType !== "ANY" ? recordType : undefined,
			}),
			signal,
		});
	} catch (error) {
		if (error instanceof DOMException && error.name === "AbortError") {
			throw error;
		}
		throw new DnsLookupRequestError(
			"Could not reach the DNS lookup service. Check your connection and try again.",
		);
	}

	if (response.status === 429) {
		throw new DnsLookupRequestError(
			"Too many requests from this network. Wait a moment and try again.",
			429,
		);
	}

	if (!response.ok) {
		let detail: string | undefined;
		try {
			const body = (await response.json()) as {
				why?: string;
				message?: string;
				error?: string;
			};
			detail = body.why || body.message || body.error;
		} catch {}
		throw new DnsLookupRequestError(
			detail || "Something went wrong performing that DNS lookup.",
			response.status,
		);
	}

	return (await response.json()) as DnsLookupResponse;
}
