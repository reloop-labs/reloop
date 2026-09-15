import * as dns from "node:dns/promises";
import * as tls from "node:tls";
import {
	checkDomainAuth,
	cleanDomainInput,
	type DomainAuthReport,
} from "@be/tools/routes/tools/auth-checker/auth-checker.service";
import { DOMAIN_DNSBL_PROVIDERS } from "@be/tools/routes/tools/blocklist-check/dnsbl-providers";
import { querySingleDnsbl } from "@be/tools/routes/tools/blocklist-check/dnsbl-query";
import {
	checkDomainAge,
	type DomainAgeReport,
} from "@be/tools/routes/tools/domain-age/domain-age.service";

export interface CategoryResult {
	score: number; // 0–100 within category
	weight: number; // contribution to overall (percentage points)
	status: "pass" | "warn" | "fail";
	summary: string;
}

export interface ReputationCheck {
	id: string;
	category: "authentication" | "blocklist" | "domain_age" | "dns_health";
	label: string;
	status: "pass" | "warn" | "fail" | "info";
	detail: string;
	record?: string;
}

export interface DomainReputationResult {
	domain: string;
	resolvedAt: string;
	responseTimeMs: number;
	score: number; // 0–100
	grade: "A+" | "A" | "B" | "C" | "D" | "F";
	verdict: "excellent" | "good" | "fair" | "poor" | "critical";
	verdictLabel: string;
	breakdown: {
		authentication: CategoryResult;
		blocklist: CategoryResult;
		domainAge: CategoryResult;
		dnsHealth: CategoryResult;
	};
	details: {
		authentication: {
			spf: {
				exists: boolean;
				record?: string;
				qualifier?: string;
				status: "pass" | "warn" | "fail";
				detail: string;
			};
			dkim: {
				detected: boolean;
				selector?: string;
				record?: string;
				status: "pass" | "warn" | "fail";
				detail: string;
			};
			dmarc: {
				exists: boolean;
				record?: string;
				policy?: string;
				pct?: number;
				status: "pass" | "warn" | "fail";
				detail: string;
			};
		};
		blocklist: {
			cleanCount: number;
			listedCount: number;
			totalChecked: number;
			listings: Array<{
				zone: string;
				name: string;
				listed: boolean;
				returnCode?: string;
			}>;
		};
		domainAge: {
			ageDays?: number;
			createdDate?: string;
			expiryDate?: string;
			registrar?: string;
			tier: "mature" | "established" | "warming" | "young" | "new" | "unknown";
			detail: string;
		};
		dnsHealth: {
			mxRecords: Array<{ exchange: string; priority: number }>;
			aRecords: string[];
			nsRecords: string[];
			hasPtr: boolean;
			sslValid: boolean;
			sslDaysRemaining?: number;
			sslIssuer?: string;
		};
	};
	checks: ReputationCheck[];
	recommendations: string[];
}

export function normalizeDomain(input: string): string {
	const cleaned = cleanDomainInput(input).split(":")[0] ?? "";
	return cleaned.replace(/^www\./i, "");
}

export function isValidDomain(domain: string): boolean {
	if (!domain || domain.length > 253) return false;
	const parts = domain.split(".");
	if (parts.length < 2) return false;
	for (const part of parts) {
		if (!part || part.length > 63) return false;
		if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(part)) return false;
	}
	return true;
}

/**
 * TLS / SSL handshake check on port 443
 */
async function checkSsl(domain: string) {
	try {
		return await new Promise<{
			valid: boolean;
			daysRemaining?: number;
			issuer?: string;
		}>((resolve) => {
			const socket = tls.connect(
				{
					host: domain,
					port: 443,
					servername: domain,
					timeout: 3500,
				},
				() => {
					const cert = socket.getPeerCertificate();
					socket.end();
					if (!cert || !cert.valid_to) {
						resolve({ valid: false });
						return;
					}

					const expiry = new Date(cert.valid_to);
					const now = new Date();
					const diffDays = Math.floor(
						(expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
					);
					const valid = socket.authorized && diffDays > 0;
					const issuer = cert.issuer
						? cert.issuer.O || cert.issuer.CN || "Unknown"
						: undefined;

					resolve({
						valid,
						daysRemaining: diffDays,
						issuer,
					});
				},
			);

			socket.on("error", () => {
				socket.destroy();
				resolve({ valid: false });
			});

			socket.on("timeout", () => {
				socket.destroy();
				resolve({ valid: false });
			});
		});
	} catch {
		return { valid: false };
	}
}

/**
 * Query domain-specific DNSBL providers directly using dnsbl-query logic
 */
async function queryDomainDnsbl(domain: string) {
	const results = await Promise.all(
		DOMAIN_DNSBL_PROVIDERS.map((provider) =>
			querySingleDnsbl({
				queryName: `${domain}.${provider.host}`,
				targetLabel: domain,
				provider,
			}),
		),
	);

	const listedCount = results.filter(
		(r) => r.isListed || r.status === "listed",
	).length;
	const cleanCount = results.filter(
		(r) => !r.isListed && r.status !== "listed",
	).length;

	return {
		totalChecked: results.length,
		listedCount,
		cleanCount,
		results,
	};
}

/**
 * Main domain reputation check function that composes auth-checker, domain-age, and blocklist services
 */
export async function checkDomainReputation(
	rawInput: string,
): Promise<DomainReputationResult> {
	const startTime = Date.now();
	const domain = normalizeDomain(rawInput);

	if (!isValidDomain(domain)) {
		throw new Error(
			`Invalid domain name: '${rawInput}'. Enter a valid domain like 'example.com'.`,
		);
	}

	// Concurrently run existing domain services + TLS & DNS checks
	const [authReport, ageReport, blocklistReport, sslInfo, aRecords, nsRecords] =
		await Promise.all([
			checkDomainAuth(domain).catch(() => null as DomainAuthReport | null),
			checkDomainAge(domain).catch(() => null as DomainAgeReport | null),
			queryDomainDnsbl(domain).catch(() => ({
				totalChecked: 0,
				listedCount: 0,
				cleanCount: 0,
				results: [],
			})),
			checkSsl(domain),
			dns.resolve4(domain).catch(() => [] as string[]),
			dns.resolveNs(domain).catch(() => [] as string[]),
		]);

	// 1. Process Authentication (35% weight)
	const authScore = authReport ? authReport.score : 0;
	const authCategoryScore = Math.min(100, Math.max(0, authScore));
	const authStatus: "pass" | "warn" | "fail" =
		authCategoryScore >= 75
			? "pass"
			: authCategoryScore >= 45
				? "warn"
				: "fail";

	const spfStatus = (
		authReport?.spf.status === "pass"
			? "pass"
			: authReport?.spf.status === "warn"
				? "warn"
				: "fail"
	) as "pass" | "warn" | "fail";
	const dkimStatus = (
		authReport?.dkim.status === "pass"
			? "pass"
			: authReport?.dkim.status === "warn"
				? "warn"
				: "fail"
	) as "pass" | "warn" | "fail";
	const dmarcStatus = (
		authReport?.dmarc.status === "pass"
			? "pass"
			: authReport?.dmarc.status === "warn"
				? "warn"
				: "fail"
	) as "pass" | "warn" | "fail";

	const spfSummary = authReport?.spf.published
		? `SPF record published with qualifier '${authReport.spf.qualifier || "~all"}' (${authReport.spf.lookupCount}/10 lookups).`
		: "No SPF record published.";

	const dkimSummary = authReport?.dkim.published
		? `DKIM active on selector '${authReport.dkim.selector || "default"}'${authReport.dkim.keyLength ? ` (${authReport.dkim.keyLength}-bit ${authReport.dkim.algorithm || "rsa"})` : ""}.`
		: "No standard DKIM selector detected in DNS.";

	const dmarcSummary = authReport?.dmarc.published
		? `DMARC policy is set to '${authReport.dmarc.policy || "none"}' (pct=${authReport.dmarc.percentage ?? 100}%).`
		: "No DMARC record detected at _dmarc." + domain;

	// 2. Process Blocklists (30% weight)
	const listedCount = blocklistReport.listedCount;
	const totalBlocklists = blocklistReport.totalChecked;
	const cleanCount = blocklistReport.cleanCount;

	let blocklistScore = 100;
	if (listedCount === 1) blocklistScore = 50;
	else if (listedCount > 1) blocklistScore = 0;

	const blocklistStatus: "pass" | "warn" | "fail" =
		listedCount === 0 ? "pass" : listedCount === 1 ? "warn" : "fail";

	const listings = blocklistReport.results.map((r) => ({
		zone: r.host || r.id || "unknown",
		name: r.name,
		listed: Boolean(r.isListed || r.status === "listed"),
		returnCode: r.responseCodes?.[0] || undefined,
	}));

	// 3. Process Domain Age (20% weight)
	let ageTier:
		| "mature"
		| "established"
		| "warming"
		| "young"
		| "new"
		| "unknown" = "unknown";
	let ageCategoryScore = 50;

	if (ageReport) {
		const v = ageReport.verdict;
		if (v === "mature") {
			ageTier = "mature";
			ageCategoryScore = 100;
		} else if (v === "established") {
			ageTier = "established";
			ageCategoryScore = 80;
		} else if (v === "warming") {
			ageTier = "warming";
			ageCategoryScore = 65;
		} else if (v === "cold") {
			ageTier = "young";
			ageCategoryScore = 35;
		} else if (v === "too_new") {
			ageTier = "new";
			ageCategoryScore = 15;
		} else {
			ageTier = "unknown";
			ageCategoryScore = 50;
		}
	}

	const ageStatus: "pass" | "warn" | "fail" =
		ageCategoryScore >= 70 ? "pass" : ageCategoryScore >= 50 ? "warn" : "fail";

	const ageDays =
		ageReport?.age.ageDays !== null && ageReport?.age.ageDays !== undefined
			? ageReport.age.ageDays
			: undefined;

	// 4. Process DNS & Infrastructure (15% weight)
	const mxRecords = authReport?.mx.records || [];
	const resolvedNameservers = ageReport?.nameservers.hosts.length
		? ageReport.nameservers.hosts
		: nsRecords;

	let hasPtr = false;
	const firstARecord = aRecords[0];
	if (firstARecord) {
		try {
			const ptrs = await dns.reverse(firstARecord);
			hasPtr = ptrs.length > 0;
		} catch {
			hasPtr = false;
		}
	}

	let dnsScore = 0;
	if (mxRecords.length > 0) dnsScore += 5;
	if (aRecords.length > 0) dnsScore += 4;
	if (resolvedNameservers.length >= 2) dnsScore += 3;
	if (sslInfo.valid) dnsScore += 3;

	const dnsCategoryScore = Math.min(100, Math.round((dnsScore / 15) * 100));
	const dnsStatus: "pass" | "warn" | "fail" =
		dnsCategoryScore >= 75 ? "pass" : dnsCategoryScore >= 50 ? "warn" : "fail";

	// Overall composite score (0–100)
	const overallScore = Math.round(
		authCategoryScore * 0.35 +
			blocklistScore * 0.3 +
			ageCategoryScore * 0.2 +
			dnsCategoryScore * 0.15,
	);

	// Grade & Verdict
	let grade: "A+" | "A" | "B" | "C" | "D" | "F" = "F";
	let verdict: "excellent" | "good" | "fair" | "poor" | "critical" = "critical";
	let verdictLabel = "Critical issues detected. High risk of inbox rejection.";

	if (overallScore >= 90) {
		grade = "A+";
		verdict = "excellent";
		verdictLabel = "Outstanding reputation. Maximum deliverability confidence.";
	} else if (overallScore >= 80) {
		grade = "A";
		verdict = "good";
		verdictLabel =
			"Strong reputation. Well protected against spam classification.";
	} else if (overallScore >= 70) {
		grade = "B";
		verdict = "good";
		verdictLabel =
			"Good reputation with minor authentication or policy recommendations.";
	} else if (overallScore >= 55) {
		grade = "C";
		verdict = "fair";
		verdictLabel =
			"Fair reputation. Vulnerable to deliverability degradation or impersonation.";
	} else if (overallScore >= 40) {
		grade = "D";
		verdict = "poor";
		verdictLabel =
			"Poor reputation. Missing critical records or flagged on blocklists.";
	}

	// Flat Checks List
	const checks: ReputationCheck[] = [
		{
			id: "auth_spf",
			category: "authentication",
			label: "SPF Record",
			status: spfStatus,
			detail: spfSummary,
			record: authReport?.spf.rawRecord || undefined,
		},
		{
			id: "auth_dkim",
			category: "authentication",
			label: "DKIM Signature",
			status: dkimStatus,
			detail: dkimSummary,
			record: authReport?.dkim.rawRecord || undefined,
		},
		{
			id: "auth_dmarc",
			category: "authentication",
			label: "DMARC Policy",
			status: dmarcStatus,
			detail: dmarcSummary,
			record: authReport?.dmarc.rawRecord || undefined,
		},
		{
			id: "blocklist_domain",
			category: "blocklist",
			label: "Domain & URI Blocklists",
			status: blocklistStatus,
			detail:
				listedCount === 0
					? `Clean across all ${cleanCount} monitored domain DNS blocklist zones.`
					: `Flagged on ${listedCount} of ${totalBlocklists} domain blocklists.`,
		},
		{
			id: "age_maturity",
			category: "domain_age",
			label: "Domain Age & Warmup Stage",
			status: ageStatus,
			detail:
				ageReport?.summary ||
				(ageDays
					? `Domain is ${ageDays} days old.`
					: "Domain age could not be verified."),
		},
		{
			id: "dns_mx",
			category: "dns_health",
			label: "Mail Server Routing (MX)",
			status: mxRecords.length > 0 ? "pass" : "fail",
			detail:
				mxRecords.length > 0
					? `${mxRecords.length} MX server(s) configured${authReport?.mx.provider ? ` (${authReport.mx.provider})` : ""}.`
					: "No MX records found for receiving reply mail.",
		},
		{
			id: "dns_resolution",
			category: "dns_health",
			label: "A / AAAA Address Resolution",
			status: aRecords.length > 0 ? "pass" : "fail",
			detail:
				aRecords.length > 0
					? `Resolves to IP: ${aRecords.join(", ")}`
					: "Domain does not resolve to an IPv4 (A) record.",
		},
		{
			id: "dns_ns",
			category: "dns_health",
			label: "Authoritative Nameservers",
			status: resolvedNameservers.length >= 2 ? "pass" : "warn",
			detail: `${resolvedNameservers.length} authoritative nameserver(s) detected${ageReport?.nameservers.provider ? ` (${ageReport.nameservers.provider})` : ""}.`,
		},
		{
			id: "infra_ssl",
			category: "dns_health",
			label: "Web TLS/SSL Certificate",
			status: sslInfo.valid ? "pass" : "info",
			detail: sslInfo.valid
				? `Valid TLS certificate (${sslInfo.daysRemaining} days remaining, issued by ${sslInfo.issuer || "trusted CA"}).`
				: "No active TLS certificate found on port 443.",
		},
	];

	// Actionable Recommendations
	const recommendations: string[] = [];

	if (authReport?.spf.warnings.length) {
		for (const w of authReport.spf.warnings) recommendations.push(w);
	} else if (!authReport?.spf.published) {
		recommendations.push(
			"Publish an SPF record with 'v=spf1 ... ~all' to authorize sending servers.",
		);
	}

	if (authReport?.dmarc.warnings.length) {
		for (const w of authReport.dmarc.warnings) recommendations.push(w);
	} else if (!authReport?.dmarc.published) {
		recommendations.push(
			"Add a DMARC policy at '_dmarc." +
				domain +
				"' to protect against email spoofing.",
		);
	}

	if (listedCount > 0) {
		for (const item of blocklistReport.results.filter(
			(r) => r.isListed || r.status === "listed",
		)) {
			recommendations.push(
				`Request delisting from ${item.name} (${item.host}) after investigating recent outbound sending.`,
			);
		}
	}

	if (ageReport?.warnings.length) {
		for (const w of ageReport.warnings) {
			if (!recommendations.includes(w)) recommendations.push(w);
		}
	}

	if (recommendations.length === 0) {
		recommendations.push(
			"All domain reputation checks passed. Maintain high sender reputation by monitoring engagement and spam complaint rates below 0.1%.",
		);
	}

	const responseTimeMs = Date.now() - startTime;

	return {
		domain,
		resolvedAt: new Date().toISOString(),
		responseTimeMs,
		score: overallScore,
		grade,
		verdict,
		verdictLabel,
		breakdown: {
			authentication: {
				score: authCategoryScore,
				weight: 35,
				status: authStatus,
				summary: `SPF ${spfStatus}, DKIM ${dkimStatus}, DMARC ${dmarcStatus}`,
			},
			blocklist: {
				score: blocklistScore,
				weight: 30,
				status: blocklistStatus,
				summary: `${cleanCount}/${totalBlocklists} domain blocklists clean`,
			},
			domainAge: {
				score: ageCategoryScore,
				weight: 20,
				status: ageStatus,
				summary:
					ageDays !== undefined
						? `${ageDays} days old (${ageTier})`
						: `Stage: ${ageTier}`,
			},
			dnsHealth: {
				score: dnsCategoryScore,
				weight: 15,
				status: dnsStatus,
				summary: `${mxRecords.length} MX, ${resolvedNameservers.length} NS, SSL ${sslInfo.valid ? "active" : "inactive"}`,
			},
		},
		details: {
			authentication: {
				spf: {
					exists: !!authReport?.spf.published,
					record: authReport?.spf.rawRecord || undefined,
					qualifier: authReport?.spf.qualifier || undefined,
					status: spfStatus,
					detail: spfSummary,
				},
				dkim: {
					detected: !!authReport?.dkim.published,
					selector: authReport?.dkim.selector || undefined,
					record: authReport?.dkim.rawRecord || undefined,
					status: dkimStatus,
					detail: dkimSummary,
				},
				dmarc: {
					exists: !!authReport?.dmarc.published,
					record: authReport?.dmarc.rawRecord || undefined,
					policy: authReport?.dmarc.policy || undefined,
					pct: authReport?.dmarc.percentage ?? undefined,
					status: dmarcStatus,
					detail: dmarcSummary,
				},
			},
			blocklist: {
				cleanCount,
				listedCount,
				totalChecked: totalBlocklists,
				listings,
			},
			domainAge: {
				ageDays,
				createdDate: ageReport?.age.createdAt || undefined,
				expiryDate: ageReport?.age.expiresAt || undefined,
				registrar: ageReport?.registry.registrar || undefined,
				tier: ageTier,
				detail: ageReport?.summary || "Domain age evaluation.",
			},
			dnsHealth: {
				mxRecords: mxRecords.map((m) => ({
					exchange: m.exchange,
					priority: m.priority,
				})),
				aRecords,
				nsRecords: resolvedNameservers,
				hasPtr,
				sslValid: sslInfo.valid,
				sslDaysRemaining: sslInfo.daysRemaining,
				sslIssuer: sslInfo.issuer,
			},
		},
		checks,
		recommendations,
	};
}
