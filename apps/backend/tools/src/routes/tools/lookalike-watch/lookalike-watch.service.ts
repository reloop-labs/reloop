import dns from "node:dns/promises";
import net from "node:net";
import { cleanDomainInput } from "@be/tools/routes/tools/auth-checker/auth-checker.service";
import { toRegistrableDomain } from "@be/tools/routes/tools/domain-age/domain-age.service";
import { withDeadline } from "@be/tools/utils/deadline";
import {
	type CandidateItem,
	generateLookalikeCandidates,
} from "./generate-candidates";

export interface LookalikeHit {
	name: string;
	unicodeName: string | null;
	trick: "tld" | "affix" | "typo" | "homoglyph";
	registered: boolean;
	mailCapable: boolean;
	mx: boolean;
	spf: boolean;
}

export interface LookalikeWatchReport {
	domain: string;
	registrableDomain: string;
	resolvedAt: string;
	responseTimeMs: number;
	verdict: "mail_twins" | "parked_twins" | "clear_scan";
	headline: string;
	summary: string;
	disclaimer: string;
	scanned: number;
	hits: LookalikeHit[];
	nextStep: {
		title: string;
		body: string;
		href: string;
	};
}

export function evaluateLookalikes(
	domain: string,
	registrableDomain: string,
	hits: LookalikeHit[],
	scannedCount: number,
	responseTimeMs = 0,
	resolvedAt = new Date().toISOString(),
): LookalikeWatchReport {
	const disclaimer =
		"This is a finite public-DNS scan of common permutations, not every possible lookalike on the internet or proof of an active attack.";

	const mailTwins = hits.filter((h) => h.mailCapable);
	const parkedTwins = hits.filter((h) => !h.mailCapable && h.registered);

	// Sort hits: mail capable first, then registered
	const sortedHits = [...hits].sort((a, b) => {
		if (a.mailCapable && !b.mailCapable) return -1;
		if (!a.mailCapable && b.mailCapable) return 1;
		return a.name.localeCompare(b.name);
	});

	if (mailTwins.length > 0) {
		return {
			domain,
			registrableDomain,
			resolvedAt,
			responseTimeMs,
			verdict: "mail_twins",
			headline: "Lookalikes can send mail that looks like you",
			summary: `${mailTwins.length} lookalike domain(s) have active MX or SPF records configured and can send mail. DMARC on ${registrableDomain} cannot stop emails sent from these separate domains.`,
			disclaimer,
			scanned: scannedCount,
			hits: sortedHits,
			nextStep: {
				title: "Enforce DMARC & monitor lookalikes",
				body: `Enforce p=reject on ${registrableDomain} in Reloop so authentic mail is recognizable, and consider defensive registrations for critical service prefixes.`,
				href: "/dashboard/signup",
			},
		};
	}

	if (parkedTwins.length > 0) {
		return {
			domain,
			registrableDomain,
			resolvedAt,
			responseTimeMs,
			verdict: "parked_twins",
			headline: "Twins exist; none look set up to send",
			summary: `${parkedTwins.length} lookalike domain(s) are registered with active DNS, but none currently publish MX or SPF mail records.`,
			disclaimer,
			scanned: scannedCount,
			hits: sortedHits,
			nextStep: {
				title: "Lock down your primary sending domain",
				body: `Keep your authentic domain ${registrableDomain} locked with SPF, DKIM, and DMARC in Reloop to protect your brand reputation.`,
				href: "/dashboard/signup",
			},
		};
	}

	return {
		domain,
		registrableDomain,
		resolvedAt,
		responseTimeMs,
		verdict: "clear_scan",
		headline: "No common lookalikes in this scan",
		summary: `None of the ${scannedCount} generated lookalike permutations resolved active DNS or mail records. This scan covered top alternative TLDs, common typos, hyphens, and homoglyphs.`,
		disclaimer,
		scanned: scannedCount,
		hits: [],
		nextStep: {
			title: "Maintain 100% email authentication",
			body: `Ensure ${registrableDomain} is fully authenticated in Reloop so mailbox providers always verify your legitimate outbound mail.`,
			href: "/dashboard/signup",
		},
	};
}

async function probeSingleCandidate(
	candidate: CandidateItem,
	resolver: dns.Resolver,
): Promise<LookalikeHit | null> {
	const host = candidate.name;

	try {
		// Run NS / A / MX / TXT queries concurrently with a 1500ms deadline
		const [nsRes, aRes, mxRes, txtRes] = await Promise.allSettled([
			withDeadline(resolver.resolveNs(host), 1500, `NS(${host})`),
			withDeadline(resolver.resolve4(host), 1500, `A(${host})`),
			withDeadline(resolver.resolveMx(host), 1500, `MX(${host})`),
			withDeadline(resolver.resolveTxt(host), 1500, `TXT(${host})`),
		]);

		const hasNs =
			nsRes.status === "fulfilled" && (nsRes.value || []).length > 0;
		const hasA = aRes.status === "fulfilled" && (aRes.value || []).length > 0;
		const hasMx =
			mxRes.status === "fulfilled" && (mxRes.value || []).length > 0;

		let hasSpf = false;
		if (txtRes.status === "fulfilled" && Array.isArray(txtRes.value)) {
			const flatTxts = txtRes.value.map((r) => r.join("").trim());
			hasSpf = flatTxts.some((t) => t.startsWith("v=spf1"));
		}

		const isRegistered = hasNs || hasA || hasMx || hasSpf;
		if (!isRegistered) return null;

		const isMailCapable = hasMx || hasSpf;

		return {
			name: candidate.name,
			unicodeName: candidate.unicodeName,
			trick: candidate.trick,
			registered: true,
			mailCapable: isMailCapable,
			mx: hasMx,
			spf: hasSpf,
		};
	} catch {
		return null;
	}
}

export async function runLookalikeWatch(
	rawInput: string,
	resolver: dns.Resolver = new dns.Resolver(),
	concurrency = 8,
): Promise<LookalikeWatchReport> {
	const start = Date.now();
	const { registrableDomain } = toRegistrableDomain(rawInput);
	const cleaned = cleanDomainInput(rawInput);

	const candidates = generateLookalikeCandidates(registrableDomain, 65);
	const hits: LookalikeHit[] = [];

	// Run candidates in batches of `concurrency` to avoid DNS flood
	for (let i = 0; i < candidates.length; i += concurrency) {
		const batch = candidates.slice(i, i + concurrency);
		const batchResults = await Promise.all(
			batch.map((c) => probeSingleCandidate(c, resolver)),
		);

		for (const hit of batchResults) {
			if (hit) hits.push(hit);
		}
	}

	const responseTimeMs = Date.now() - start;

	return evaluateLookalikes(
		cleaned,
		registrableDomain,
		hits,
		candidates.length,
		responseTimeMs,
		new Date().toISOString(),
	);
}
