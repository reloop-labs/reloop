import dns from "node:dns/promises";
import net from "node:net";
import { domainToASCII } from "node:url";
import { withDeadline } from "@be/tools/utils/deadline";
import { detectDnsProvider, type DnsProviderInfo } from "./dns-providers";

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
	type: DnsRecordType;
	name: string;
	value: string;
	ttl: number | null;
	priority?: number;
	details?: Record<string, string | number | boolean | null | undefined>;
}

export interface DnsDiagnosticCheck {
	id: string;
	name: string;
	category: "dns" | "email_auth" | "security" | "web";
	status: "pass" | "warn" | "fail" | "info";
	message: string;
	details?: string;
}

export interface DnsLookupResult {
	query: string;
	domain: string;
	recordType: DnsRecordType;
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

const DEFAULT_TIMEOUT_MS = 2500;
const publicResolver = new dns.Resolver();
publicResolver.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

export function parseQueryInput(rawInput: string): {
	target: string;
	requestedType: DnsRecordType;
} {
	let input = (rawInput || "").trim().toLowerCase();
	let requestedType: DnsRecordType = "ANY";

	// Support prefix syntax: "a:domain.com", "mx:domain.com", "txt:domain.com", etc.
	const prefixMatch = input.match(
		/^(a|aaaa|mx|txt|cname|ns|soa|caa|ptr|srv|any|dmarc|spf|dkim):(.+)$/i,
	);
	if (prefixMatch && prefixMatch[1] && prefixMatch[2]) {
		const prefix = prefixMatch[1].toUpperCase();
		const remainder = prefixMatch[2].trim();

		if (prefix === "DMARC") {
			requestedType = "TXT";
			input = remainder.startsWith("_dmarc.") ? remainder : `_dmarc.${remainder}`;
		} else if (prefix === "SPF") {
			requestedType = "TXT";
			input = remainder;
		} else if (prefix === "DKIM") {
			requestedType = "TXT";
			input = remainder;
		} else if (prefix === "ANY") {
			requestedType = "ANY";
			input = remainder;
		} else {
			requestedType = prefix as DnsRecordType;
			input = remainder;
		}
	}

	// Clean up URL protocols or trailing slashes
	input = input.replace(/^https?:\/\//i, "");
	const slash = input.search(/[/?#]/);
	if (slash !== -1) input = input.slice(0, slash);
	input = input.replace(/\.$/, "");

	// Punycode conversion if needed
	let asciiDomain = input;
	if (!net.isIP(input)) {
		try {
			asciiDomain = domainToASCII(input) || input;
		} catch {
			asciiDomain = input;
		}
	}

	return { target: asciiDomain, requestedType };
}

function isNxdomain(error: unknown): boolean {
	const code = (error as { code?: string })?.code;
	return code === "ENOTFOUND" || code === "ENODATA" || code === "ENOTIMP" || code === "ESERVFAIL";
}

export async function performDnsLookup(
	rawTarget: string,
	typeOverride?: DnsRecordType,
	customResolver: dns.Resolver = publicResolver,
): Promise<DnsLookupResult> {
	const parsed = parseQueryInput(rawTarget);
	const target = parsed.target;
	const recordType = typeOverride && typeOverride !== "ANY" ? typeOverride : parsed.requestedType;

	const startTime = Date.now();
	const records: FormattedDnsRecord[] = [];
	const diagnostics: DnsDiagnosticCheck[] = [];

	let authoritativeNs: string[] = [];
	let primaryNs: string | null = null;

	const isIpInput = Boolean(net.isIP(target));

	// If input is an IP, do a PTR lookup
	if (isIpInput || recordType === "PTR") {
		try {
			const ptrs = await withDeadline(
				customResolver.reverse(target),
				DEFAULT_TIMEOUT_MS,
				"PTR Lookup",
			);
			for (const ptr of ptrs) {
				records.push({
					type: "PTR",
					name: target,
					value: ptr,
					ttl: null,
				});
			}
			diagnostics.push({
				id: "ptr-record",
				name: "Reverse DNS (PTR)",
				category: "dns",
				status: "pass",
				message: `Resolved ${ptrs.length} PTR hostnames for ${target}`,
				details: ptrs.join(", "),
			});
		} catch (error) {
			if (!isNxdomain(error)) {
				diagnostics.push({
					id: "ptr-record",
					name: "Reverse DNS (PTR)",
					category: "dns",
					status: "fail",
					message: "PTR lookup failed or no reverse hostname found",
					details: error instanceof Error ? error.message : "Reverse lookup error",
				});
			} else {
				diagnostics.push({
					id: "ptr-record",
					name: "Reverse DNS (PTR)",
					category: "dns",
					status: "warn",
					message: "No PTR record found for this IP address",
				});
			}
		}

		const responseTimeMs = Date.now() - startTime;
		return {
			query: rawTarget,
			domain: target,
			recordType: recordType === "ANY" ? "PTR" : recordType,
			resolvedAt: new Date().toISOString(),
			responseTimeMs,
			nameserver: null,
			provider: null,
			records,
			diagnostics,
			summary: {
				totalRecords: records.length,
				hasA: false,
				hasAaaa: false,
				hasMx: false,
				hasTxt: false,
				hasCname: false,
				hasNs: false,
				hasSoa: false,
				hasDmarc: false,
				hasSpf: false,
				dmarcPolicy: null,
				spfRecord: null,
			},
		};
	}

	// Normal Domain DNS Resolution
	// 1. Fetch NS records for DNS provider detection
	try {
		const nsList = await withDeadline(
			customResolver.resolveNs(target),
			DEFAULT_TIMEOUT_MS,
			"NS Lookup",
		);
		authoritativeNs = nsList;
		primaryNs = nsList[0] || null;
		for (const ns of nsList) {
			records.push({
				type: "NS",
				name: target,
				value: ns,
				ttl: null,
			});
		}
	} catch {}

	// If recordType is not NS, also query the specific or ALL types
	const shouldFetchA = recordType === "ANY" || recordType === "A";
	const shouldFetchAaaa = recordType === "ANY" || recordType === "AAAA";
	const shouldFetchMx = recordType === "ANY" || recordType === "MX";
	const shouldFetchTxt = recordType === "ANY" || recordType === "TXT";
	const shouldFetchCname = recordType === "ANY" || recordType === "CNAME";
	const shouldFetchSoa = recordType === "ANY" || recordType === "SOA";
	const shouldFetchCaa = recordType === "ANY" || recordType === "CAA";
	const shouldFetchSrv = recordType === "SRV";

	let spfRecordString: string | null = null;
	let dmarcPolicyString: string | null = null;

	await Promise.allSettled([
		// A Records
		(async () => {
			if (!shouldFetchA) return;
			try {
				const aRecords = await withDeadline(
					customResolver.resolve4(target, { ttl: true }),
					DEFAULT_TIMEOUT_MS,
					"A Lookup",
				);
				for (const a of aRecords) {
					records.push({
						type: "A",
						name: target,
						value: a.address,
						ttl: a.ttl,
					});
				}
			} catch {}
		})(),

		// AAAA Records
		(async () => {
			if (!shouldFetchAaaa) return;
			try {
				const aaaaRecords = await withDeadline(
					customResolver.resolve6(target, { ttl: true }),
					DEFAULT_TIMEOUT_MS,
					"AAAA Lookup",
				);
				for (const aaaa of aaaaRecords) {
					records.push({
						type: "AAAA",
						name: target,
						value: aaaa.address,
						ttl: aaaa.ttl,
					});
				}
			} catch {}
		})(),

		// MX Records
		(async () => {
			if (!shouldFetchMx) return;
			try {
				const mxRecords = await withDeadline(
					customResolver.resolveMx(target),
					DEFAULT_TIMEOUT_MS,
					"MX Lookup",
				);
				const sorted = [...mxRecords].sort((a, b) => a.priority - b.priority);
				for (const mx of sorted) {
					records.push({
						type: "MX",
						name: target,
						value: mx.exchange,
						priority: mx.priority,
						ttl: null,
					});
				}
			} catch {}
		})(),

		// TXT Records
		(async () => {
			if (!shouldFetchTxt) return;
			try {
				const txtRecords = await withDeadline(
					customResolver.resolveTxt(target),
					DEFAULT_TIMEOUT_MS,
					"TXT Lookup",
				);
				for (const chunks of txtRecords) {
					const val = chunks.join("").trim();
					if (val.startsWith("v=spf1")) {
						spfRecordString = val;
					}
					records.push({
						type: "TXT",
						name: target,
						value: val,
						ttl: null,
					});
				}
			} catch {}
		})(),

		// CNAME Records
		(async () => {
			if (!shouldFetchCname) return;
			try {
				const cnames = await withDeadline(
					customResolver.resolveCname(target),
					DEFAULT_TIMEOUT_MS,
					"CNAME Lookup",
				);
				for (const cname of cnames) {
					records.push({
						type: "CNAME",
						name: target,
						value: cname,
						ttl: null,
					});
				}
			} catch {}
		})(),

		// SOA Records
		(async () => {
			if (!shouldFetchSoa) return;
			try {
				const soa = await withDeadline(
					customResolver.resolveSoa(target),
					DEFAULT_TIMEOUT_MS,
					"SOA Lookup",
				);
				if (soa) {
					records.push({
						type: "SOA",
						name: target,
						value: `${soa.nsname} ${soa.hostmaster} (Serial: ${soa.serial}, Refresh: ${soa.refresh}, Retry: ${soa.retry}, Expire: ${soa.expire}, MinTTL: ${soa.minttl})`,
						ttl: soa.minttl,
						details: {
							nsname: soa.nsname,
							hostmaster: soa.hostmaster,
							serial: soa.serial,
							refresh: soa.refresh,
							retry: soa.retry,
							expire: soa.expire,
							minttl: soa.minttl,
						},
					});
					if (!primaryNs) primaryNs = soa.nsname;
				}
			} catch {}
		})(),

		// CAA Records
		(async () => {
			if (!shouldFetchCaa) return;
			try {
				const caaRecords = await withDeadline(
					customResolver.resolveCaa(target),
					DEFAULT_TIMEOUT_MS,
					"CAA Lookup",
				);
				for (const caa of caaRecords) {
					const val = caa.issue
						? `issue "${caa.issue}"`
						: caa.issuewild
							? `issuewild "${caa.issuewild}"`
							: caa.iodef
								? `iodef "${caa.iodef}"`
								: JSON.stringify(caa);
					records.push({
						type: "CAA",
						name: target,
						value: val,
						ttl: null,
					});
				}
			} catch {}
		})(),

		// SRV Records (if requested)
		(async () => {
			if (!shouldFetchSrv) return;
			try {
				const srvs = await withDeadline(
					customResolver.resolveSrv(target),
					DEFAULT_TIMEOUT_MS,
					"SRV Lookup",
				);
				for (const srv of srvs) {
					records.push({
						type: "SRV",
						name: target,
						value: `${srv.name}:${srv.port}`,
						priority: srv.priority,
						ttl: null,
						details: {
							name: srv.name,
							port: srv.port,
							priority: srv.priority,
							weight: srv.weight,
						},
					});
				}
			} catch {}
		})(),

		// DMARC TXT Check (at _dmarc.<target>)
		(async () => {
			try {
				const dmarcTarget = target.startsWith("_dmarc.") ? target : `_dmarc.${target}`;
				const dmarcTxt = await withDeadline(
					customResolver.resolveTxt(dmarcTarget),
					DEFAULT_TIMEOUT_MS,
					"DMARC TXT Lookup",
				);
				for (const chunks of dmarcTxt) {
					const val = chunks.join("").trim();
					if (val.startsWith("v=DMARC1")) {
						const policyMatch = val.match(/p=(none|quarantine|reject)/i);
						dmarcPolicyString = policyMatch?.[1]?.toLowerCase() || "none";
						if (recordType === "ANY" || target.startsWith("_dmarc.")) {
							records.push({
								type: "TXT",
								name: dmarcTarget,
								value: val,
								ttl: null,
							});
						}
					}
				}
			} catch {}
		})(),
	]);

	// Filter records if a specific recordType was explicitly queried
	const filteredRecords =
		recordType === "ANY"
			? records
			: records.filter((r) => r.type === recordType);

	// Detect DNS Provider
	const provider = detectDnsProvider(authoritativeNs);

	// Run Diagnostics & Health Evaluation
	// 1. DNS Record Published
	if (records.length > 0) {
		diagnostics.push({
			id: "dns-record-published",
			name: "DNS Record Published",
			category: "dns",
			status: "pass",
			message: `Found ${records.length} published DNS record${records.length > 1 ? "s" : ""}`,
		});
	} else {
		diagnostics.push({
			id: "dns-record-published",
			name: "DNS Record Published",
			category: "dns",
			status: "fail",
			message: "No DNS records were found for this domain or query.",
		});
	}

	// 2. DNS Provider Detection
	if (provider) {
		diagnostics.push({
			id: "dns-provider",
			name: "DNS Hosting Provider",
			category: "dns",
			status: "info",
			message: `Hosted on ${provider.name} (${provider.category.replace("_", " ")})`,
			details: primaryNs ? `Nameserver: ${primaryNs}` : undefined,
		});
	}

	// 3. MX Record Check
	const hasMx = records.some((r) => r.type === "MX");
	if (hasMx) {
		diagnostics.push({
			id: "mx-records",
			name: "Mail Exchange (MX)",
			category: "email_auth",
			status: "pass",
			message: "Valid MX records configured for receiving email",
		});
	} else if (!target.startsWith("_") && recordType === "ANY") {
		diagnostics.push({
			id: "mx-records",
			name: "Mail Exchange (MX)",
			category: "email_auth",
			status: "warn",
			message: "No MX records found. Domain cannot receive incoming email.",
		});
	}

	// 4. SPF Check
	if (spfRecordString) {
		const isPermissive = spfRecordString.includes("+all") || spfRecordString.includes("?all");
		diagnostics.push({
			id: "spf-record",
			name: "SPF Record",
			category: "email_auth",
			status: isPermissive ? "warn" : "pass",
			message: isPermissive
				? "SPF record found but uses a permissive (+all/?all) policy"
				: "Valid SPF authorization record published",
			details: spfRecordString,
		});
	} else if (recordType === "ANY" && !target.startsWith("_")) {
		diagnostics.push({
			id: "spf-record",
			name: "SPF Record",
			category: "email_auth",
			status: "warn",
			message: "Missing SPF record. Senders might suffer spoofing or delivery issues.",
		});
	}

	// 5. DMARC Check
	if (dmarcPolicyString) {
		const isStrict = dmarcPolicyString === "reject" || dmarcPolicyString === "quarantine";
		diagnostics.push({
			id: "dmarc-policy",
			name: "DMARC Protection",
			category: "email_auth",
			status: isStrict ? "pass" : "info",
			message: `DMARC record published with policy p=${dmarcPolicyString}`,
			details: isStrict
				? "Domain has strong protection against email spoofing"
				: "Monitoring policy active (p=none); consider enforcing p=quarantine or p=reject",
		});
	} else if (recordType === "ANY" && !target.startsWith("_")) {
		diagnostics.push({
			id: "dmarc-policy",
			name: "DMARC Protection",
			category: "email_auth",
			status: "warn",
			message: "No DMARC policy published. Domain lacks spoof protection.",
		});
	}

	const responseTimeMs = Date.now() - startTime;

	return {
		query: rawTarget,
		domain: target,
		recordType,
		resolvedAt: new Date().toISOString(),
		responseTimeMs,
		nameserver: primaryNs,
		provider,
		records: filteredRecords,
		diagnostics,
		summary: {
			totalRecords: filteredRecords.length,
			hasA: records.some((r) => r.type === "A"),
			hasAaaa: records.some((r) => r.type === "AAAA"),
			hasMx: records.some((r) => r.type === "MX"),
			hasTxt: records.some((r) => r.type === "TXT"),
			hasCname: records.some((r) => r.type === "CNAME"),
			hasNs: records.some((r) => r.type === "NS"),
			hasSoa: records.some((r) => r.type === "SOA"),
			hasDmarc: Boolean(dmarcPolicyString),
			hasSpf: Boolean(spfRecordString),
			dmarcPolicy: dmarcPolicyString,
			spfRecord: spfRecordString,
		},
	};
}
