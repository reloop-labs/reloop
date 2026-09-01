import dns from "node:dns/promises";
import net from "node:net";
import { domainToASCII } from "node:url";
import { withDeadline } from "@be/tools/utils/deadline";

export interface AuthDiagnosticCheck {
	id: string;
	name: string;
	category: "spf" | "dkim" | "dmarc" | "mx" | "security";
	status: "pass" | "warn" | "fail" | "info";
	message: string;
	details?: string;
}

export interface AuthSpfResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	qualifier: string | null;
	lookupCount: number;
	mechanisms: string[];
	includes: string[];
	ip4: string[];
	ip6: string[];
	warnings: string[];
}

export interface AuthDkimResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	selector: string | null;
	rawRecord: string | null;
	publicKey: string | null;
	keyLength: number | null;
	algorithm: string | null;
	testedSelectors: string[];
	warnings: string[];
}

export interface AuthDmarcResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	policy: string | null;
	subdomainPolicy: string | null;
	percentage: number | null;
	rua: string[];
	ruf: string[];
	dkimAlignment: string | null;
	spfAlignment: string | null;
	warnings: string[];
}

export interface AuthMxResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	provider: string | null;
	records: Array<{ exchange: string; priority: number }>;
	warnings: string[];
}

export interface AuthBimiResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	svgUrl: string | null;
	vmcUrl: string | null;
}

export interface AuthMtaStsResult {
	status: "pass" | "warn" | "fail" | "info";
	published: boolean;
	rawRecord: string | null;
	mode: string | null;
}

export interface DomainAuthReport {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	score: number;
	grade: string;
	verdict: "fully_aligned" | "partially_aligned" | "misconfigured" | "vulnerable";
	verdictLabel: string;
	spf: AuthSpfResult;
	dkim: AuthDkimResult;
	dmarc: AuthDmarcResult;
	mx: AuthMxResult;
	bimi: AuthBimiResult;
	mtaSts: AuthMtaStsResult;
	diagnostics: AuthDiagnosticCheck[];
}

const DEFAULT_TIMEOUT_MS = 2500;
const publicResolver = new dns.Resolver();
publicResolver.setServers(["1.1.1.1", "1.0.0.1", "8.8.8.8", "8.8.4.4"]);

const COMMON_DKIM_SELECTORS = [
	"s1",
	"google",
	"default",
	"k1",
	"mail",
	"selector1",
	"smtp",
	"k2",
	"mandrill",
	"sendgrid",
	"postmark",
	"ses",
];

const MX_PROVIDERS: Array<{ name: string; patterns: RegExp[] }> = [
	{ name: "Google Workspace", patterns: [/google\.com$/i, /googlemail\.com$/i, /aspmx\.l\.google\.com$/i] },
	{ name: "Microsoft 365 / Outlook", patterns: [/outlook\.com$/i, /microsoft\.com$/i, /protection\.outlook\.com$/i] },
	{ name: "Zoho Mail", patterns: [/zoho\.(?:com|eu|in)$/i] },
	{ name: "Proton Mail", patterns: [/protonmail\.ch$/i, /proton\.me$/i] },
	{ name: "Fastmail", patterns: [/messagingengine\.com$/i, /fastmail\.com$/i] },
	{ name: "Amazon SES", patterns: [/amazonses\.com$/i] },
	{ name: "Reloop Inbound", patterns: [/reloop\.email$/i, /reloop\.sh$/i] },
	{ name: "Mimecast", patterns: [/mimecast\.com$/i] },
	{ name: "Proofpoint", patterns: [/pphosted\.com$/i, /proofpoint\.com$/i] },
	{ name: "Mailgun", patterns: [/mailgun\.org$/i] },
	{ name: "SendGrid", patterns: [/sendgrid\.net$/i] },
	{ name: "Postmark", patterns: [/postmarkapp\.com$/i, /wildbit\.com$/i] },
	{ name: "iCloud Mail", patterns: [/icloud\.com$/i, /apple\.com$/i] },
];

export function cleanDomainInput(raw: string): string {
	let input = (raw || "").trim().toLowerCase();
	input = input.replace(/^https?:\/\//i, "");
	const slash = input.search(/[/?#]/);
	if (slash !== -1) input = input.slice(0, slash);
	input = input.replace(/\.$/, "");

	if (!net.isIP(input)) {
		try {
			return domainToASCII(input) || input;
		} catch {
			return input;
		}
	}
	return input;
}

function detectMxProvider(records: Array<{ exchange: string }>): string | null {
	for (const r of records) {
		const host = r.exchange.toLowerCase();
		for (const provider of MX_PROVIDERS) {
			if (provider.patterns.some((p) => p.test(host))) {
				return provider.name;
			}
		}
	}
	return null;
}

export function parseSpfRecord(spfString: string): {
	qualifier: string;
	lookupCount: number;
	mechanisms: string[];
	includes: string[];
	ip4: string[];
	ip6: string[];
	warnings: string[];
} {
	const parts = spfString.split(/\s+/).filter(Boolean);
	const mechanisms: string[] = [];
	const includes: string[] = [];
	const ip4: string[] = [];
	const ip6: string[] = [];
	const warnings: string[] = [];

	let qualifier = "~all";
	let lookupCount = 0;

	for (const part of parts.slice(1)) {
		mechanisms.push(part);

		const lower = part.toLowerCase();
		if (lower === "-all") qualifier = "-all";
		else if (lower === "~all") qualifier = "~all";
		else if (lower === "?all") qualifier = "?all";
		else if (lower === "+all") {
			qualifier = "+all";
			warnings.push("The '+all' qualifier allows ANY IP on the internet to spoof email for your domain.");
		}

		if (lower.startsWith("include:")) {
			lookupCount++;
			includes.push(part.slice(8));
		} else if (lower.startsWith("a") || lower.startsWith("a:")) {
			lookupCount++;
		} else if (lower.startsWith("mx") || lower.startsWith("mx:")) {
			lookupCount++;
		} else if (lower.startsWith("ptr") || lower.startsWith("ptr:")) {
			lookupCount++;
			warnings.push("The 'ptr' mechanism is deprecated in RFC 7208 and slows down mail delivery.");
		} else if (lower.startsWith("exists:")) {
			lookupCount++;
		} else if (lower.startsWith("redirect=")) {
			lookupCount++;
		} else if (lower.startsWith("ip4:")) {
			ip4.push(part.slice(4));
		} else if (lower.startsWith("ip6:")) {
			ip6.push(part.slice(4));
		}
	}

	if (lookupCount > 10) {
		warnings.push(`SPF contains ${lookupCount} DNS lookup mechanisms, exceeding the RFC 7208 limit of 10 (PermError).`);
	}

	return { qualifier, lookupCount, mechanisms, includes, ip4, ip6, warnings };
}

export function parseDkimRecord(rawDkim: string): {
	publicKey: string | null;
	keyLength: number | null;
	algorithm: string | null;
	warnings: string[];
} {
	const warnings: string[] = [];
	const pairs = rawDkim.split(";").map((p) => p.trim());
	let publicKey: string | null = null;
	let algorithm = "rsa";

	for (const pair of pairs) {
		const eq = pair.indexOf("=");
		if (eq === -1) continue;
		const key = pair.slice(0, eq).trim().toLowerCase();
		const val = pair.slice(eq + 1).trim();

		if (key === "p") {
			publicKey = val;
		} else if (key === "k") {
			algorithm = val.toLowerCase();
		}
	}

	let keyLength: number | null = null;
	if (publicKey) {
		try {
			const decoded = Buffer.from(publicKey.replace(/\s+/g, ""), "base64");
			const rawBytes = decoded.length;
			if (rawBytes >= 256) keyLength = 2048;
			else if (rawBytes >= 128) keyLength = 1024;
			else if (rawBytes >= 64) keyLength = 512;
			else keyLength = rawBytes * 8;

			if (keyLength < 1024) {
				warnings.push(`DKIM public key is ${keyLength}-bit, which is considered insecure and obsolete.`);
			} else if (keyLength === 1024) {
				warnings.push("1024-bit DKIM key detected. Upgrading to a 2048-bit RSA key is recommended by NIST.");
			}
		} catch {
			warnings.push("Failed to decode DKIM public key base64 data.");
		}
	} else {
		warnings.push("DKIM record is missing the public key ('p=') tag.");
	}

	return { publicKey, keyLength, algorithm, warnings };
}

export function parseDmarcRecord(rawDmarc: string): {
	policy: string | null;
	subdomainPolicy: string | null;
	percentage: number | null;
	rua: string[];
	ruf: string[];
	dkimAlignment: string | null;
	spfAlignment: string | null;
	warnings: string[];
} {
	const warnings: string[] = [];
	const pairs = rawDmarc.split(";").map((p) => p.trim());

	let policy: string | null = null;
	let subdomainPolicy: string | null = null;
	let percentage: number | null = 100;
	const rua: string[] = [];
	const ruf: string[] = [];
	let dkimAlignment = "relaxed (r)";
	let spfAlignment = "relaxed (r)";

	for (const pair of pairs) {
		const eq = pair.indexOf("=");
		if (eq === -1) continue;
		const key = pair.slice(0, eq).trim().toLowerCase();
		const val = pair.slice(eq + 1).trim();

		if (key === "p") {
			policy = val.toLowerCase();
		} else if (key === "sp") {
			subdomainPolicy = val.toLowerCase();
		} else if (key === "pct") {
			percentage = Number.parseInt(val, 10) || 100;
			if (percentage < 100) {
				warnings.push(`DMARC policy applies to only ${percentage}% of outbound messages.`);
			}
		} else if (key === "rua") {
			rua.push(...val.split(",").map((v) => v.trim()));
		} else if (key === "ruf") {
			ruf.push(...val.split(",").map((v) => v.trim()));
		} else if (key === "adkim") {
			dkimAlignment = val.toLowerCase() === "s" ? "strict (s)" : "relaxed (r)";
		} else if (key === "aspf") {
			spfAlignment = val.toLowerCase() === "s" ? "strict (s)" : "relaxed (r)";
		}
	}

	if (!policy) {
		warnings.push("DMARC record is missing mandatory policy tag ('p=').");
	} else if (policy === "none") {
		warnings.push("DMARC policy is set to 'p=none' (monitoring only). Spoofed messages will still reach inboxes.");
	}

	if (rua.length === 0) {
		warnings.push("No aggregate reporting address ('rua=') configured. You will not receive DMARC delivery reports.");
	}

	return {
		policy,
		subdomainPolicy,
		percentage,
		rua,
		ruf,
		dkimAlignment,
		spfAlignment,
		warnings,
	};
}

export async function checkDomainAuth(
	rawDomain: string,
	selectorOverride?: string,
	resolver: dns.Resolver = publicResolver,
): Promise<DomainAuthReport> {
	const domain = cleanDomainInput(rawDomain);
	const start = Date.now();
	const diagnostics: AuthDiagnosticCheck[] = [];

	if (!domain || net.isIP(domain)) {
		throw new Error("Please enter a valid domain name (e.g. stripe.com).");
	}

	// 1. MX Lookup
	let mxResult: AuthMxResult = {
		status: "fail",
		published: false,
		provider: null,
		records: [],
		warnings: [],
	};

	try {
		const mxList = await withDeadline(
			resolver.resolveMx(domain),
			DEFAULT_TIMEOUT_MS,
			"MX Lookup",
		);

		if (mxList && mxList.length > 0) {
			const sorted = [...mxList].sort((a, b) => a.priority - b.priority);
			const provider = detectMxProvider(sorted);
			mxResult = {
				status: "pass",
				published: true,
				provider,
				records: sorted,
				warnings: [],
			};
			diagnostics.push({
				id: "mx-records",
				name: "Mail Routing (MX)",
				category: "mx",
				status: "pass",
				message: `Configured with ${sorted.length} mail exchange server(s)${provider ? ` via ${provider}` : ""}`,
				details: sorted.map((m) => `${m.exchange} (priority ${m.priority})`).join(", "),
			});
		} else {
			mxResult.warnings.push("No MX records found. The domain cannot receive inbound email.");
			diagnostics.push({
				id: "mx-records",
				name: "Mail Routing (MX)",
				category: "mx",
				status: "warn",
				message: "No MX records published for domain",
			});
		}
	} catch {
		mxResult.warnings.push("MX lookup returned no records or timed out.");
		diagnostics.push({
			id: "mx-records",
			name: "Mail Routing (MX)",
			category: "mx",
			status: "warn",
			message: "No active MX records found",
		});
	}

	// 2. SPF Lookup
	let spfResult: AuthSpfResult = {
		status: "fail",
		published: false,
		rawRecord: null,
		qualifier: null,
		lookupCount: 0,
		mechanisms: [],
		includes: [],
		ip4: [],
		ip6: [],
		warnings: [],
	};

	try {
		const txtRecords = await withDeadline(
			resolver.resolveTxt(domain),
			DEFAULT_TIMEOUT_MS,
			"SPF TXT Lookup",
		);

		const allSpf = (txtRecords || [])
			.map((entry) => entry.join("").trim())
			.filter((txt) => txt.startsWith("v=spf1") || txt === "v=spf1");

		if (allSpf.length > 1) {
			spfResult.status = "fail";
			spfResult.published = true;
			spfResult.rawRecord = allSpf[0] || null;
			spfResult.warnings.push(`Multiple SPF records found (${allSpf.length}). RFC 7208 Section 3.2 specifies that multiple SPF records cause a PermError.`);
			diagnostics.push({
				id: "spf-record",
				name: "Sender Policy Framework (SPF)",
				category: "spf",
				status: "fail",
				message: `Multiple SPF records found (${allSpf.length}) — causes PermError`,
				details: allSpf.join(" | "),
			});
		} else if (allSpf.length === 1) {
			const raw = allSpf[0]!;
			const parsed = parseSpfRecord(raw);
			const isStrict = parsed.qualifier === "-all" || parsed.qualifier === "~all";
			const status = parsed.lookupCount > 10 ? "fail" : isStrict ? "pass" : "warn";

			spfResult = {
				status,
				published: true,
				rawRecord: raw,
				qualifier: parsed.qualifier,
				lookupCount: parsed.lookupCount,
				mechanisms: parsed.mechanisms,
				includes: parsed.includes,
				ip4: parsed.ip4,
				ip6: parsed.ip6,
				warnings: parsed.warnings,
			};

			diagnostics.push({
				id: "spf-record",
				name: "Sender Policy Framework (SPF)",
				category: "spf",
				status,
				message: `SPF published with ${parsed.lookupCount}/10 DNS lookups and '${parsed.qualifier}' qualifier`,
				details: raw,
			});
		} else {
			spfResult.warnings.push("No SPF TXT record published for this domain.");
			diagnostics.push({
				id: "spf-record",
				name: "Sender Policy Framework (SPF)",
				category: "spf",
				status: "fail",
				message: "Missing SPF record — domain can be easily spoofed",
			});
		}
	} catch {
		spfResult.warnings.push("Failed to query root domain TXT records.");
		diagnostics.push({
			id: "spf-record",
			name: "Sender Policy Framework (SPF)",
			category: "spf",
			status: "fail",
			message: "Missing SPF record",
		});
	}

	// 3. DMARC Lookup
	let dmarcResult: AuthDmarcResult = {
		status: "fail",
		published: false,
		rawRecord: null,
		policy: null,
		subdomainPolicy: null,
		percentage: null,
		rua: [],
		ruf: [],
		dkimAlignment: null,
		spfAlignment: null,
		warnings: [],
	};

	try {
		const dmarcTxts = await withDeadline(
			resolver.resolveTxt(`_dmarc.${domain}`),
			DEFAULT_TIMEOUT_MS,
			"DMARC TXT Lookup",
		);

		const dmarcMatches = (dmarcTxts || [])
			.map((entry) => entry.join("").trim())
			.filter((txt) => txt.toLowerCase().startsWith("v=dmarc1"));

		if (dmarcMatches.length > 1) {
			dmarcResult.status = "fail";
			dmarcResult.published = true;
			dmarcResult.rawRecord = dmarcMatches[0] || null;
			dmarcResult.warnings.push("Multiple DMARC records found. Only one DMARC record is permitted.");
			diagnostics.push({
				id: "dmarc-record",
				name: "DMARC Policy Enforcement",
				category: "dmarc",
				status: "fail",
				message: "Multiple DMARC records found — invalid configuration",
			});
		} else if (dmarcMatches.length === 1) {
			const raw = dmarcMatches[0]!;
			const parsed = parseDmarcRecord(raw);
			const status = parsed.policy === "reject" ? "pass" : parsed.policy === "quarantine" ? "pass" : "warn";

			dmarcResult = {
				status,
				published: true,
				rawRecord: raw,
				policy: parsed.policy,
				subdomainPolicy: parsed.subdomainPolicy,
				percentage: parsed.percentage,
				rua: parsed.rua,
				ruf: parsed.ruf,
				dkimAlignment: parsed.dkimAlignment,
				spfAlignment: parsed.spfAlignment,
				warnings: parsed.warnings,
			};

			diagnostics.push({
				id: "dmarc-record",
				name: "DMARC Policy Enforcement",
				category: "dmarc",
				status,
				message: `DMARC published with policy 'p=${parsed.policy || "none"}'${parsed.rua.length > 0 ? ` and reports to ${parsed.rua[0]}` : ""}`,
				details: raw,
			});
		} else {
			dmarcResult.warnings.push("No DMARC record published at _dmarc." + domain);
			diagnostics.push({
				id: "dmarc-record",
				name: "DMARC Policy Enforcement",
				category: "dmarc",
				status: "fail",
				message: "Missing DMARC record — receivers will accept unauthorized emails",
			});
		}
	} catch {
		dmarcResult.warnings.push("No DMARC record found at _dmarc." + domain);
		diagnostics.push({
			id: "dmarc-record",
			name: "DMARC Policy Enforcement",
			category: "dmarc",
			status: "fail",
			message: "Missing DMARC record",
		});
	}

	// 4. DKIM Lookup (Selector testing)
	let dkimResult: AuthDkimResult = {
		status: "info",
		published: false,
		selector: selectorOverride || null,
		rawRecord: null,
		publicKey: null,
		keyLength: null,
		algorithm: null,
		testedSelectors: [],
		warnings: [],
	};

	const selectorsToTry = selectorOverride
		? [selectorOverride.trim().toLowerCase()]
		: COMMON_DKIM_SELECTORS;

	dkimResult.testedSelectors = selectorsToTry;

	for (const selector of selectorsToTry) {
		try {
			const dkimTxts = await withDeadline(
				resolver.resolveTxt(`${selector}._domainkey.${domain}`),
				1200,
				`DKIM Lookup (${selector})`,
			);

			const validDkim = (dkimTxts || [])
				.map((entry) => entry.join("").trim())
				.find((txt) => txt.toLowerCase().includes("p=") || txt.toLowerCase().includes("v=dkim1"));

			if (validDkim) {
				const parsed = parseDkimRecord(validDkim);
				const status = parsed.keyLength && parsed.keyLength >= 2048 ? "pass" : parsed.publicKey ? "pass" : "warn";

				dkimResult = {
					status,
					published: true,
					selector,
					rawRecord: validDkim,
					publicKey: parsed.publicKey,
					keyLength: parsed.keyLength,
					algorithm: parsed.algorithm,
					testedSelectors: selectorsToTry,
					warnings: parsed.warnings,
				};

				diagnostics.push({
					id: "dkim-record",
					name: "DKIM Signature & Key",
					category: "dkim",
					status,
					message: `Found DKIM key for selector '${selector}' (${parsed.keyLength ? `${parsed.keyLength}-bit ` : ""}${parsed.algorithm?.toUpperCase() || "RSA"})`,
					details: `${selector}._domainkey.${domain}`,
				});
				break;
			}
		} catch {
			// Continue to next selector
		}
	}

	if (!dkimResult.published) {
		if (selectorOverride) {
			dkimResult.status = "fail";
			dkimResult.warnings.push(`No DKIM public key found for selector '${selectorOverride}' at ${selectorOverride}._domainkey.${domain}`);
			diagnostics.push({
				id: "dkim-record",
				name: "DKIM Signature & Key",
				category: "dkim",
				status: "fail",
				message: `No DKIM record at ${selectorOverride}._domainkey.${domain}`,
			});
		} else {
			dkimResult.status = "info";
			dkimResult.warnings.push("No DKIM public key found on standard selectors (s1, google, default, k1). Try entering your specific selector.");
			diagnostics.push({
				id: "dkim-record",
				name: "DKIM Signature & Key",
				category: "dkim",
				status: "info",
				message: "No standard DKIM selector detected — enter your custom selector above to verify",
			});
		}
	}

	// 5. Bonus: BIMI Lookup
	let bimiResult: AuthBimiResult = {
		status: "info",
		published: false,
		rawRecord: null,
		svgUrl: null,
		vmcUrl: null,
	};

	try {
		const bimiTxts = await withDeadline(
			resolver.resolveTxt(`default._bimi.${domain}`),
			1000,
			"BIMI Lookup",
		);
		const bimiStr = (bimiTxts || [])
			.map((entry) => entry.join("").trim())
			.find((txt) => txt.toLowerCase().startsWith("v=bimi1"));

		if (bimiStr) {
			const svgMatch = bimiStr.match(/l=([^;]+)/i);
			const vmcMatch = bimiStr.match(/a=([^;]+)/i);
			bimiResult = {
				status: "pass",
				published: true,
				rawRecord: bimiStr,
				svgUrl: svgMatch ? svgMatch[1]!.trim() : null,
				vmcUrl: vmcMatch ? vmcMatch[1]!.trim() : null,
			};
			diagnostics.push({
				id: "bimi-record",
				name: "Brand Indicators (BIMI)",
				category: "security",
				status: "pass",
				message: "BIMI record published — avatar logo displayed in supporting inboxes",
				details: bimiResult.svgUrl || undefined,
			});
		}
	} catch {}

	// 6. Bonus: MTA-STS Lookup
	let mtaStsResult: AuthMtaStsResult = {
		status: "info",
		published: false,
		rawRecord: null,
		mode: null,
	};

	try {
		const stsTxts = await withDeadline(
			resolver.resolveTxt(`_mta-sts.${domain}`),
			1000,
			"MTA-STS Lookup",
		);
		const stsStr = (stsTxts || [])
			.map((entry) => entry.join("").trim())
			.find((txt) => txt.toLowerCase().startsWith("v=stsv1"));

		if (stsStr) {
			mtaStsResult = {
				status: "pass",
				published: true,
				rawRecord: stsStr,
				mode: "enforce",
			};
			diagnostics.push({
				id: "mta-sts",
				name: "Mail Transport Security (MTA-STS)",
				category: "security",
				status: "pass",
				message: "MTA-STS policy record published for encrypted TLS transmission",
			});
		}
	} catch {}

	// Calculate Score (0 - 100) & Grade
	let score = 0;
	if (spfResult.published) {
		if (spfResult.status === "pass") score += 30;
		else if (spfResult.status === "warn") score += 20;
		else if (spfResult.status === "fail") score += 5;
	}

	if (dmarcResult.published) {
		if (dmarcResult.policy === "reject") score += 40;
		else if (dmarcResult.policy === "quarantine") score += 30;
		else if (dmarcResult.policy === "none") score += 15;
	}

	if (dkimResult.published && dkimResult.status === "pass") {
		score += 20;
	} else if (!selectorOverride && !dkimResult.published) {
		// Neutral partial credit for DKIM when selector is unknown
		score += 10;
	}

	if (mxResult.published && mxResult.status === "pass") {
		score += 10;
	}

	let grade = "F";
	let verdict: "fully_aligned" | "partially_aligned" | "misconfigured" | "vulnerable" = "vulnerable";
	let verdictLabel = "Vulnerable to Email Spoofing";

	if (score >= 90) {
		grade = "A+";
		verdict = "fully_aligned";
		verdictLabel = "Fully Protected & Aligned";
	} else if (score >= 80) {
		grade = "A";
		verdict = "fully_aligned";
		verdictLabel = "Protected — Strong Auth Alignment";
	} else if (score >= 65) {
		grade = "B";
		verdict = "partially_aligned";
		verdictLabel = "Partially Protected (Action Recommended)";
	} else if (score >= 45) {
		grade = "C";
		verdict = "misconfigured";
		verdictLabel = "Misconfigured — Policy Gaps Detected";
	} else if (score >= 25) {
		grade = "D";
		verdict = "vulnerable";
		verdictLabel = "High Risk — Weak or Missing Authentication";
	}

	const responseTimeMs = Date.now() - start;

	return {
		domain,
		resolvedAt: new Date().toISOString(),
		responseTimeMs,
		score,
		grade,
		verdict,
		verdictLabel,
		spf: spfResult,
		dkim: dkimResult,
		dmarc: dmarcResult,
		mx: mxResult,
		bimi: bimiResult,
		mtaSts: mtaStsResult,
		diagnostics,
	};
}
