import { and, count, eq, gte } from "drizzle-orm";
import net from "node:net";
import { getDomain, getPublicSuffix } from "tldts";
import { db } from "./client";
import { rdapEndpointsForDomain } from "./rdap-registry";
import { emailLog } from "./schema/email";
import { utcDayStart } from "./reserve-send-credits";

/**
 * Domain-age based initial daily cap.
 * Applies to all plans (free, pro, growth, enterprise) for newly added domains.
 * Uses registrar registration age (RDAP) not Reloop added date.
 * Falls back to Reloop added date if RDAP unavailable.
 */

export type DomainAgeCap = number | null; // null = dynamic (no age cap, defer to plan)

export function getDomainAgeDays(createdAt: Date, now: Date = new Date()): number {
	const ms = now.getTime() - new Date(createdAt).getTime();
	if (ms <= 0) return 0;
	return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/**
 * Initial daily cap per domain age band (applies to ALL packages).
 * Uses upper bound of the range in the spec for a deterministic cap:
 * 0–1 day: 10–20 -> 20
 * 2–3 days: 25–50 -> 50
 * 4–7 days: 50–100 -> 100
 * 8–14 days: 100–250 -> 250
 * 15–30 days: 250–500 -> 500
 * 30+ days: Dynamic (null) -> defer to plan/reputation
 */
export function getDomainInitialDailyCap(ageDays: number): DomainAgeCap {
	if (ageDays <= 1) return 20;
	if (ageDays <= 3) return 50;
	if (ageDays <= 7) return 100;
	if (ageDays <= 14) return 250;
	if (ageDays <= 30) return 500;
	return null; // 30+ days: dynamic
}

export function getDomainAgeCapForDomain(
	createdAt: Date,
	now: Date = new Date(),
): DomainAgeCap {
	return getDomainInitialDailyCap(getDomainAgeDays(createdAt, now));
}

export async function getDomainDailySentCount(
	domainId: string,
	now: Date = new Date(),
): Promise<number> {
	const dayStart = utcDayStart(now);
	const [row] = await db
		.select({ value: count() })
		.from(emailLog)
		.where(and(eq(emailLog.domainId, domainId), gte(emailLog.createdAt, dayStart)));
	return row?.value ?? 0;
}

// ── Registrar age via RDAP (domain age checker tool logic) ────────────────

type ParsedRdapResult = {
	found: boolean;
	lookupStatus?: "found" | "not_found" | "no_rdap_service" | "error";
	createdAt: string | null;
	expiresAt: string | null;
};

function cleanDomainInput(input: string): string {
	return input.trim().toLowerCase().replace(/^https?:\/\//, "").split("/")[0]?.split("?")[0]?.split("#")[0] ?? "";
}

function toRegistrableDomain(input: string): string {
	const cleaned = cleanDomainInput(input);
	if (!cleaned || net.isIP(cleaned)) throw new Error("Invalid domain");
	return getDomain(cleaned) || cleaned;
}

function emptyRdap(status: ParsedRdapResult["lookupStatus"], rawStatus?: number): ParsedRdapResult {
	return { found: status === "found", lookupStatus: status, createdAt: null, expiresAt: null, rawStatus } as ParsedRdapResult & { rawStatus?: number };
}

function parseRdapResponse(data: any): ParsedRdapResult {
	if (!data || typeof data !== "object") return { found: false, lookupStatus: "not_found", createdAt: null, expiresAt: null };
	let createdAt: string | null = null;
	let expiresAt: string | null = null;
	if (Array.isArray(data.events)) {
		for (const ev of data.events) {
			if (ev.eventAction === "registration" && ev.eventDate) createdAt = new Date(ev.eventDate).toISOString();
			if ((ev.eventAction === "expiration" || ev.eventAction === "registrar expiration") && ev.eventDate) expiresAt = new Date(ev.eventDate).toISOString();
		}
	}
	return { found: true, lookupStatus: "found", createdAt, expiresAt };
}

function classifyRdapHttp(status: number, body: unknown): ParsedRdapResult {
	if (status === 200) return parseRdapResponse(body);
	const title = body && typeof body === "object" && "title" in body && typeof (body as { title: unknown }).title === "string" ? (body as { title: string }).title : "";
	if (status === 404 && /no rdap service is available/i.test(title)) return emptyRdap("no_rdap_service", 404);
	if (status === 404) return emptyRdap("not_found", 404);
	return emptyRdap("error", status);
}

async function fetchRdapUrl(rdapUrl: string): Promise<ParsedRdapResult> {
	const controller = new AbortController();
	const t = setTimeout(() => controller.abort(), 4000);
	try {
		const r = await fetch(rdapUrl, { headers: { Accept: "application/rdap+json, application/json", "User-Agent": "Reloop-Domain-Age-Cap/1.0" }, signal: controller.signal });
		let body: unknown = null;
		try { body = await r.json(); } catch { body = null; }
		return classifyRdapHttp(r.status, body);
	} catch { return emptyRdap("error"); } finally { clearTimeout(t); }
}

const IANA_RDAP_BOOTSTRAP_URL = "https://data.iana.org/rdap/dns.json";
const BOOTSTRAP_TTL_MS = 24 * 60 * 60 * 1000;
let ianaBootstrapCache: { loadedAt: number; map: Map<string, string> } | null = null;

function parseIanaRdapBootstrap(data: { services?: Array<[string[], string[]]> }): Map<string, string> {
	const map = new Map<string, string>();
	for (const svc of data.services || []) {
		const [tlds, urls] = svc;
		const base = urls?.[0];
		if (!base) continue;
		for (const tld of tlds || []) map.set(tld.toLowerCase(), base);
	}
	return map;
}

async function loadIanaRdapBootstrap(): Promise<Map<string, string>> {
	if (ianaBootstrapCache && Date.now() - ianaBootstrapCache.loadedAt < BOOTSTRAP_TTL_MS) return ianaBootstrapCache.map;
	try {
		const c = new AbortController();
		const t = setTimeout(() => c.abort(), 8000);
		try {
			const r = await fetch(IANA_RDAP_BOOTSTRAP_URL, { headers: { Accept: "application/json", "User-Agent": "Reloop-Domain-Age-Cap/1.0" }, signal: c.signal });
			if (!r.ok) return ianaBootstrapCache?.map ?? new Map();
			const data = (await r.json()) as { services?: Array<[string[], string[]]> };
			const map = parseIanaRdapBootstrap(data);
			ianaBootstrapCache = { loadedAt: Date.now(), map };
			return map;
		} finally { clearTimeout(t); }
	} catch { return ianaBootstrapCache?.map ?? new Map(); }
}

async function fetchRdapForDomain(registrableDomain: string): Promise<ParsedRdapResult> {
	const bootstrap = await loadIanaRdapBootstrap();
	const endpoints = rdapEndpointsForDomain(registrableDomain, { bootstrap });
	let notFound: ParsedRdapResult | null = null;
	let fallback: ParsedRdapResult = emptyRdap("error");
	for (const url of endpoints) {
		const res = await fetchRdapUrl(url);
		if (res.lookupStatus === "found") return res;
		if (res.lookupStatus === "not_found") notFound = res;
		else fallback = res;
	}
	return notFound ?? fallback;
}

const registrarCreationCache = new Map<string, { createdAt: string | null; fetchedAt: number }>();
const REGISTRAR_CACHE_TTL_MS = 12 * 60 * 60 * 1000;

export async function getRegistrarCreationDate(domainName: string): Promise<string | null> {
	const key = domainName.toLowerCase();
	const cached = registrarCreationCache.get(key);
	if (cached && Date.now() - cached.fetchedAt < REGISTRAR_CACHE_TTL_MS) return cached.createdAt;
	try {
		const { registrableDomain } = (() => {
			const cleaned = cleanDomainInput(domainName);
			if (!cleaned || net.isIP(cleaned)) return { registrableDomain: cleaned };
			return { registrableDomain: getDomain(cleaned) || cleaned };
		})();
		const rdap = await fetchRdapForDomain(registrableDomain);
		const createdAt = rdap.createdAt ?? null;
		registrarCreationCache.set(key, { createdAt, fetchedAt: Date.now() });
		return createdAt;
	} catch {
		registrarCreationCache.set(key, { createdAt: null, fetchedAt: Date.now() });
		return null;
	}
}

export async function getRegistrarAgeDays(domainName: string, now: Date = new Date()): Promise<number | null> {
	const createdAt = await getRegistrarCreationDate(domainName);
	if (!createdAt) return null;
	return getDomainAgeDays(new Date(createdAt), now);
}

export async function checkDomainAgeDailyCap(args: {
	domain: { id: string; domain: string; createdAt: Date | string };
	recipientCount: number;
	now?: Date;
}): Promise<{
	allowed: boolean;
	cap: DomainAgeCap;
	ageDays: number;
	sentToday: number;
	registrarCreationDate: string | null;
	source: "rdap" | "reloop";
}> {
	const now = args.now ?? new Date();
	const registrarCreatedAt = await getRegistrarCreationDate(args.domain.domain);
	let ageDays: number;
	let source: "rdap" | "reloop";
	let registrarCreationDate: string | null = registrarCreatedAt;
	if (registrarCreatedAt) {
		ageDays = getDomainAgeDays(new Date(registrarCreatedAt), now);
		source = "rdap";
	} else {
		ageDays = getDomainAgeDays(new Date(args.domain.createdAt), now);
		source = "reloop";
		registrarCreationDate = null;
	}
	const cap = getDomainInitialDailyCap(ageDays);
	if (cap === null) return { allowed: true, cap, ageDays, sentToday: 0, registrarCreationDate, source };
	const sentToday = await getDomainDailySentCount(args.domain.id, now);
	const allowed = sentToday + args.recipientCount <= cap;
	return { allowed, cap, ageDays, sentToday, registrarCreationDate, source };
}
