import dns from "node:dns/promises";
import net from "node:net";
import {
	type DomainAuthReport,
	checkDomainAuth,
	cleanDomainInput,
} from "@be/tools/routes/tools/auth-checker/auth-checker.service";
import { detectDnsProvider } from "@be/tools/routes/tools/dns-lookup/dns-providers";
import { getDomain, getPublicSuffix } from "tldts";
import { rdapEndpointsForDomain } from "./rdap-registry-catalog";

export type RdapLookupStatus =
	| "found"
	| "not_found"
	| "no_rdap_service"
	| "error";

export interface ParsedRdapResult {
	found: boolean;
	lookupStatus?: RdapLookupStatus;
	createdAt: string | null;
	expiresAt: string | null;
	status: string[];
	registrar: string | null;
	nameservers: string[];
	rawStatus?: number;
}

const emptyRdap = (
	lookupStatus: RdapLookupStatus,
	rawStatus?: number,
): ParsedRdapResult => ({
	found: lookupStatus === "found",
	lookupStatus,
	createdAt: null,
	expiresAt: null,
	status: [],
	registrar: null,
	nameservers: [],
	rawStatus,
});

export {
	rdapEndpointsForDomain,
	joinRdapDomainUrl,
	rdapTldCandidates,
} from "./rdap-registry-catalog";

export function classifyRdapHttp(
	status: number,
	body: unknown,
): ParsedRdapResult {
	if (status === 200) {
		return parseRdapResponse(body);
	}

	const title =
		body &&
		typeof body === "object" &&
		"title" in body &&
		typeof (body as { title: unknown }).title === "string"
			? (body as { title: string }).title
			: "";

	if (status === 404 && /no rdap service is available/i.test(title)) {
		return emptyRdap("no_rdap_service", 404);
	}

	if (status === 404) {
		return emptyRdap("not_found", 404);
	}

	return emptyRdap("error", status);
}

export interface EvaluateColdDomainInput {
	domain: string;
	registrableDomain: string;
	now?: Date;
	rdap: ParsedRdapResult;
	emailSetup: {
		spf: boolean;
		dmarc: boolean;
		dmarcPolicy: string | null;
		mx: boolean;
	};
	nameservers: {
		hosts: string[];
		provider: string | null;
		kind: "production" | "registrar_default" | "parking" | "unknown";
	};
	responseTimeMs?: number;
	resolvedAt?: string;
}

export interface DomainAgeReport {
	domain: string;
	registrableDomain: string;
	resolvedAt: string;
	responseTimeMs: number;
	verdict:
		| "too_new"
		| "cold"
		| "warming"
		| "established"
		| "mature"
		| "unknown_age"
		| "not_registered"
		| "held";
	headline: string;
	summary: string;
	disclaimer: string;
	age: {
		createdAt: string | null;
		ageDays: number | null;
		expiresAt: string | null;
		source: "rdap" | "none";
	};
	registry: {
		registrar: string | null;
		status: string[];
		tld: string | null;
	};
	nameservers: {
		hosts: string[];
		provider: string | null;
		kind: "production" | "registrar_default" | "parking" | "unknown";
	};
	emailSetup: {
		spf: boolean;
		dmarc: boolean;
		dmarcPolicy: string | null;
		mx: boolean;
	};
	nextStep: {
		title: string;
		body: string;
		href: string;
	};
	warnings: string[];
}

export function toRegistrableDomain(input: string): {
	registrableDomain: string;
	tld: string | null;
} {
	const cleaned = cleanDomainInput(input);
	if (!cleaned || net.isIP(cleaned)) {
		throw new Error(
			"Please enter a valid domain name (e.g. acme.com). An IP address does not have registration age.",
		);
	}

	const regDomain = getDomain(cleaned) || cleaned;
	const tld = getPublicSuffix(cleaned) || null;

	return { registrableDomain: regDomain, tld };
}

export function classifyNameserverKind(
	nsHosts: string[],
): "production" | "registrar_default" | "parking" | "unknown" {
	if (!nsHosts || nsHosts.length === 0) return "unknown";

	const parkingPatterns = [
		/sedoparking\.com$/i,
		/bodis\.com$/i,
		/parkingcrew\.net$/i,
		/above\.com$/i,
		/parklogic\.com$/i,
		/dan\.com$/i,
		/afternic\.com$/i,
		/cashparking\.com$/i,
		/hugedomains\.com$/i,
	];

	const registrarDefaultPatterns = [
		/registrar-servers\.com$/i, // Namecheap
		/domaincontrol\.com$/i, // GoDaddy
		/name-services\.com$/i, // Enom
		/dnsimple\.com$/i,
		/worldnic\.com$/i, // Network Solutions
		/livedns\.co\.uk$/i,
		/ovh\.net$/i,
		/gandi\.net$/i,
	];

	for (const host of nsHosts) {
		if (parkingPatterns.some((p) => p.test(host))) {
			return "parking";
		}
	}

	for (const host of nsHosts) {
		if (registrarDefaultPatterns.some((p) => p.test(host))) {
			return "registrar_default";
		}
	}

	return "production";
}

export function parseRdapResponse(data: any): ParsedRdapResult {
	if (!data || typeof data !== "object") {
		return {
			found: false,
			lookupStatus: "not_found",
			createdAt: null,
			expiresAt: null,
			status: [],
			registrar: null,
			nameservers: [],
		};
	}

	let createdAt: string | null = null;
	let expiresAt: string | null = null;

	// Extract events
	if (Array.isArray(data.events)) {
		for (const ev of data.events) {
			if (ev.eventAction === "registration" && ev.eventDate) {
				createdAt = new Date(ev.eventDate).toISOString();
			}
			if (
				(ev.eventAction === "expiration" ||
					ev.eventAction === "registrar expiration") &&
				ev.eventDate
			) {
				expiresAt = new Date(ev.eventDate).toISOString();
			}
		}
	}

	// Extract status
	const status: string[] = Array.isArray(data.status)
		? data.status.map(String)
		: [];

	// Extract registrar entity org name safely
	let registrar: string | null = null;
	if (Array.isArray(data.entities)) {
		for (const entity of data.entities) {
			if (
				Array.isArray(entity.roles) &&
				entity.roles.includes("registrar")
			) {
				if (Array.isArray(entity.vcardArray) && entity.vcardArray[1]) {
					for (const item of entity.vcardArray[1]) {
						if (item[0] === "fn" || item[0] === "org") {
							registrar = String(item[3] || "");
							break;
						}
					}
				}
				if (!registrar && entity.handle) {
					registrar = String(entity.handle);
				}
				if (registrar) break;
			}
		}
	}

	// Extract nameservers
	const nameservers: string[] = [];
	if (Array.isArray(data.nameservers)) {
		for (const ns of data.nameservers) {
			if (ns.ldhName) {
				nameservers.push(String(ns.ldhName).toLowerCase());
			}
		}
	}

	return {
		found: true,
		lookupStatus: "found",
		createdAt,
		expiresAt,
		status,
		registrar,
		nameservers,
	};
}

export function evaluateColdDomain(
	input: EvaluateColdDomainInput,
): DomainAgeReport {
	const {
		domain,
		registrableDomain,
		now = new Date(),
		rdap,
		emailSetup,
		nameservers,
		responseTimeMs = 0,
		resolvedAt = new Date().toISOString(),
	} = input;

	const disclaimer =
		"Gmail and Outlook do not publish an exact age threshold. This evaluation provides Reloop’s sending guidance based on newly registered domain filters.";

	const warnings: string[] = [];
	if (domain !== registrableDomain) {
		warnings.push(
			`Age is measured for ${registrableDomain} (the registered domain). ${domain} does not have a separate registration date.`,
		);
	}
	const lookupStatus: RdapLookupStatus =
		rdap.lookupStatus ?? (rdap.found ? "found" : "not_found");
	const dnsEvidence =
		nameservers.hosts.length > 0 ||
		emailSetup.mx ||
		emailSetup.spf ||
		emailSetup.dmarc;

	// 1. RDAP miss — only call the domain unregistered when DNS also has nothing.
	// rdap.org 404s ccTLDs like .sh/.io with "No RDAP service", which is not NXDOMAIN.
	if (lookupStatus !== "found") {
		if (lookupStatus === "not_found" && !dnsEvidence) {
			return {
				domain,
				registrableDomain,
				resolvedAt,
				responseTimeMs,
				verdict: "not_registered",
				headline: "This domain isn’t registered",
				summary: `No active registration records were found for ${registrableDomain}. You cannot send emails until the domain is registered.`,
				disclaimer,
				age: {
					createdAt: null,
					ageDays: null,
					expiresAt: null,
					source: "none",
				},
				registry: {
					registrar: null,
					status: [],
					tld: getPublicSuffix(registrableDomain) || null,
				},
				nameservers,
				emailSetup,
				nextStep: {
					title: "Register your domain",
					body: "Purchase and register this domain with a registrar before setting up email routing in Reloop.",
					href: "/dashboard/signup",
				},
				warnings,
			};
		}

		if (!emailSetup.spf || !emailSetup.dmarc) {
			warnings.push("Authentication records (SPF/DMARC) are missing.");
		}

		return {
			domain,
			registrableDomain,
			resolvedAt,
			responseTimeMs,
			verdict: "unknown_age",
			headline: "We can’t see this domain’s age",
			summary:
				lookupStatus === "no_rdap_service"
					? `The public RDAP bootstrap does not list an age service for this TLD, but DNS shows ${registrableDomain} is registered. We cannot display a creation date from rdap.org alone.`
					: `Registration records for ${registrableDomain} could not be read. The domain appears to be live in DNS, so it is not treated as unregistered.`,
			disclaimer,
			age: {
				createdAt: null,
				ageDays: null,
				expiresAt: null,
				source: "none",
			},
			registry: {
				registrar: rdap.registrar,
				status: rdap.status,
				tld: getPublicSuffix(registrableDomain) || null,
			},
			nameservers,
			emailSetup,
			nextStep: {
				title: "Publish DNS authentication",
				body: "Even with an unknown registration date, configure SPF, DKIM, and DMARC in Reloop before sending high-volume mail.",
				href: "/dashboard/signup",
			},
			warnings,
		};
	}

	// 2. Held / Suspended Check
	const heldStatuses = [
		"clienthold",
		"serverhold",
		"redemptionperiod",
		"pendingdelete",
		"inactive",
	];
	const isHeld = rdap.status.some((st) =>
		heldStatuses.some((h) => st.toLowerCase().includes(h)),
	);

	if (isHeld) {
		return {
			domain,
			registrableDomain,
			resolvedAt,
			responseTimeMs,
			verdict: "held",
			headline: "Registry is holding this name",
			summary: `The domain status indicates registry hold or pending deletion (${rdap.status.join(", ")}). Outbound emails will fail until the hold is resolved.`,
			disclaimer,
			age: {
				createdAt: rdap.createdAt,
				ageDays: rdap.createdAt
					? Math.max(
							0,
							Math.floor(
								(now.getTime() - new Date(rdap.createdAt).getTime()) /
									(1000 * 60 * 60 * 24),
							),
						)
					: null,
				expiresAt: rdap.expiresAt,
				source: "rdap",
			},
			registry: {
				registrar: rdap.registrar,
				status: rdap.status,
				tld: getPublicSuffix(registrableDomain) || null,
			},
			nameservers,
			emailSetup,
			nextStep: {
				title: "Resolve registry hold",
				body: "Contact your domain registrar to verify ownership and unlock DNS nameservers.",
				href: "/dashboard/signup",
			},
			warnings,
		};
	}

	// 3. Unknown Age (e.g. ccTLDs with redacted registration date)
	if (!rdap.createdAt) {
		if (!emailSetup.spf || !emailSetup.dmarc) {
			warnings.push("Authentication records (SPF/DMARC) are missing.");
		}

		return {
			domain,
			registrableDomain,
			resolvedAt,
			responseTimeMs,
			verdict: "unknown_age",
			headline: "We can’t see this domain’s age",
			summary:
				"The registry or ccTLD redacts the public creation date. We cannot determine whether mailbox filters consider this a brand new domain.",
			disclaimer,
			age: {
				createdAt: null,
				ageDays: null,
				expiresAt: rdap.expiresAt,
				source: "none",
			},
			registry: {
				registrar: rdap.registrar,
				status: rdap.status,
				tld: getPublicSuffix(registrableDomain) || null,
			},
			nameservers,
			emailSetup,
			nextStep: {
				title: "Publish DNS authentication",
				body: "Even with an unknown registration date, configure SPF, DKIM, and DMARC in Reloop before sending high-volume mail.",
				href: "/dashboard/signup",
			},
			warnings,
		};
	}

	// 4. Calculate Age in Days
	const createdTime = new Date(rdap.createdAt).getTime();
	const ageDays = Math.max(
		0,
		Math.floor((now.getTime() - createdTime) / (1000 * 60 * 60 * 24)),
	);

	// Expiration Warning (< 30 days)
	if (rdap.expiresAt) {
		const expiresTime = new Date(rdap.expiresAt).getTime();
		const daysUntilExpiry = Math.floor(
			(expiresTime - now.getTime()) / (1000 * 60 * 60 * 24),
		);
		if (daysUntilExpiry <= 30 && daysUntilExpiry >= 0) {
			warnings.push(
				`Domain expires in ${daysUntilExpiry} days. Renew your domain registration to protect sender reputation.`,
			);
		}
	}

	// Nameserver Warnings
	if (nameservers.kind === "parking") {
		warnings.push(
			"Nameservers point to a domain parking service rather than production email DNS.",
		);
	}

	// Email Setup Warnings
	if (!emailSetup.spf && !emailSetup.dmarc) {
		warnings.push("No SPF or DMARC records published.");
	} else if (!emailSetup.spf) {
		warnings.push("SPF record is missing.");
	} else if (!emailSetup.dmarc) {
		warnings.push("DMARC record is missing.");
	}

	// 5. Age Verdict Bands
	let verdict:
		| "too_new"
		| "cold"
		| "warming"
		| "established"
		| "mature";
	let headline = "";
	let summary = "";
	let nextStep: { title: string; body: string; href: string };

	if (ageDays <= 7) {
		verdict = "too_new";
		headline = "Too new to send — wait";
		summary = `Registered only ${ageDays === 0 ? "today" : `${ageDays} day${ageDays === 1 ? "" : "s"} ago`}. Major mailbox filters treat brand-new domains as high-risk cold senders. Do not send cold campaigns or newsletter blasts.`;
		nextStep = {
			title: "Configure DNS records while you wait",
			body: "Add your domain in Reloop and publish SPF, DKIM, and DMARC now. Allow at least 14 days before starting initial sending warmups.",
			href: "/dashboard/signup",
		};
	} else if (ageDays <= 30) {
		verdict = "cold";
		headline = "Cold domain — send almost nothing";
		summary = `Registered ${ageDays} days ago. Transactional trickles (e.g. password resets) are acceptable, but mass marketing or cold outreach will trigger spam filters.`;
		nextStep = {
			title: "Start gradual warmup with Reloop",
			body: "Connect your domain to Reloop to gradually ramp up sending volume with automated reputation protection.",
			href: "/dashboard/signup",
		};
	} else if (ageDays <= 90) {
		verdict = "warming";
		headline = "Warming — keep volume low";
		summary = `Registered ${ageDays} days ago (${Math.floor(ageDays / 30)} month${Math.floor(ageDays / 30) > 1 ? "s" : ""}). The domain is exiting the initial cold phase, but sudden volume spikes will still trigger spam filters.`;
		nextStep = {
			title: "Monitor deliverability with Reloop",
			body: "Authenticate your domain and monitor inbox placement across Gmail, Yahoo, and Outlook.",
			href: "/dashboard/signup",
		};
	} else if (ageDays <= 365) {
		verdict = "established";
		headline = "Age is not the blocker";
		summary = `Registered ${ageDays} days ago. Mailbox providers will not reject your email purely for being newly registered. Inbox placement now depends on authentication and engagement.`;
		nextStep = {
			title: "Optimize deliverability with Reloop",
			body: "Ensure 100% SPF/DKIM/DMARC alignment and monitor spam rates directly in your dashboard.",
			href: "/dashboard/signup",
		};
	} else {
		const ageYears = (ageDays / 365.25).toFixed(1);
		verdict = "mature";
		headline = "This domain is old enough";
		summary = `Registered over ${ageYears} years ago (${ageDays.toLocaleString()} days). Domain age is completely mature and will not impact email deliverability.`;
		nextStep = {
			title: "Send high-volume email with Reloop",
			body: "Scale your transactional and marketing emails with Reloop's developer API and SMTP infrastructure.",
			href: "/dashboard/signup",
		};
	}

	return {
		domain,
		registrableDomain,
		resolvedAt,
		responseTimeMs,
		verdict,
		headline,
		summary,
		disclaimer,
		age: {
			createdAt: rdap.createdAt,
			ageDays,
			expiresAt: rdap.expiresAt,
			source: "rdap",
		},
		registry: {
			registrar: rdap.registrar,
			status: rdap.status,
			tld: getPublicSuffix(registrableDomain) || null,
		},
		nameservers,
		emailSetup,
		nextStep,
		warnings,
	};
}

async function fetchRdapUrl(rdapUrl: string): Promise<ParsedRdapResult> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 4000);

	try {
		const response = await fetch(rdapUrl, {
			headers: {
				Accept: "application/rdap+json, application/json",
				"User-Agent": "Reloop-Domain-Age-Checker/1.0",
			},
			signal: controller.signal,
		});

		let body: unknown = null;
		try {
			body = await response.json();
		} catch {
			body = null;
		}

		return classifyRdapHttp(response.status, body);
	} catch {
		return emptyRdap("error");
	} finally {
		clearTimeout(timeoutId);
	}
}

const IANA_RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000;

let ianaBootstrapCache: { loadedAt: number; map: Map<string, string> } | null =
	null;

export function parseIanaRdapBootstrap(data: {
	services?: Array<[string[], string[]]>;
}): Map<string, string> {
	const map = new Map<string, string>();
	for (const service of data.services || []) {
		const [tlds, urls] = service;
		const base = urls?.[0];
		if (!base) continue;
		for (const tld of tlds || []) {
			map.set(tld.toLowerCase(), base);
		}
	}
	return map;
}

export async function loadIanaRdapBootstrap(): Promise<Map<string, string>> {
	if (
		ianaBootstrapCache &&
		Date.now() - ianaBootstrapCache.loadedAt < BOOTSTRAP_TTL_MS
	) {
		return ianaBootstrapCache.map;
	}

	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000);
		try {
			const response = await fetch(IANA_RDAP_BOOTSTRAP_URL, {
				headers: {
					Accept: "application/json",
					"User-Agent": "Reloop-Domain-Age-Checker/1.0",
				},
				signal: controller.signal,
			});

			if (!response.ok) {
				return ianaBootstrapCache?.map ?? new Map();
			}

			const data = (await response.json()) as {
				services?: Array<[string[], string[]]>;
			};
			const map = parseIanaRdapBootstrap(data);
			ianaBootstrapCache = { loadedAt: Date.now(), map };
			return map;
		} finally {
			clearTimeout(timeoutId);
		}
	} catch {
		return ianaBootstrapCache?.map ?? new Map();
	}
}

export async function fetchRdapForDomain(
	registrableDomain: string,
): Promise<ParsedRdapResult> {
	const bootstrap = await loadIanaRdapBootstrap();
	const endpoints = rdapEndpointsForDomain(registrableDomain, { bootstrap });
	let notFound: ParsedRdapResult | null = null;
	let fallback: ParsedRdapResult = emptyRdap("error");

	for (const url of endpoints) {
		const result = await fetchRdapUrl(url);
		if (result.lookupStatus === "found") {
			return result;
		}
		if (result.lookupStatus === "not_found") {
			notFound = result;
			continue;
		}
		fallback = result;
	}

	return notFound ?? fallback;
}

export async function checkDomainAge(
	rawInput: string,
	resolver: dns.Resolver = new dns.Resolver(),
): Promise<DomainAgeReport> {
	const start = Date.now();
	const { registrableDomain } = toRegistrableDomain(rawInput);

	// Query RDAP and Auth in parallel
	const [rdap, authReport, nsRecords] = await Promise.all([
		fetchRdapForDomain(registrableDomain),
		checkDomainAuth(registrableDomain).catch(() => null),
		resolver.resolveNs(registrableDomain).catch(() => [] as string[]),
	]);

	const nsHosts =
		nsRecords.length > 0 ? nsRecords : rdap.nameservers || [];
	const nsProvider = detectDnsProvider(nsHosts);
	const nsKind = classifyNameserverKind(nsHosts);

	const emailSetup = {
		spf: Boolean(authReport?.spf.published),
		dmarc: Boolean(authReport?.dmarc.published),
		dmarcPolicy: authReport?.dmarc.policy || null,
		mx: Boolean(authReport?.mx.published),
	};

	const responseTimeMs = Date.now() - start;

	return evaluateColdDomain({
		domain: cleanDomainInput(rawInput),
		registrableDomain,
		now: new Date(),
		rdap,
		emailSetup,
		nameservers: {
			hosts: nsHosts,
			provider: nsProvider?.name || null,
			kind: nsKind,
		},
		responseTimeMs,
		resolvedAt: new Date().toISOString(),
	});
}
