/**
 * domain-risk.ts — pure risk signals for a sending domain.
 *
 * No DB / network: callers pass registrar age (domain.registeredAt) and an
 * optional disposable matcher. Used by the admin spam-risk report; shaped so
 * domain creation can reuse it as a gate later.
 */

import { getDomain, getPublicSuffix } from "tldts";

export interface DomainRiskSignal {
	id: string;
	points: number;
	detail: string;
}

/** Brands phishers impersonate most. Compared after look-alike normalisation. */
export const PROTECTED_BRANDS = [
	"paypal",
	"apple",
	"icloud",
	"google",
	"gmail",
	"microsoft",
	"outlook",
	"office365",
	"amazon",
	"netflix",
	"facebook",
	"instagram",
	"whatsapp",
	"linkedin",
	"coinbase",
	"binance",
	"metamask",
	"stripe",
	"chase",
	"wellsfargo",
	"bankofamerica",
	"dhl",
	"fedex",
	"usps",
	"docusign",
	"dropbox",
	"reloop",
] as const;

/** TLDs with outsized abuse share (Spamhaus / Interisle reports). */
export const RISKY_TLDS = new Set([
	"xyz",
	"top",
	"click",
	"zip",
	"mov",
	"tk",
	"ml",
	"ga",
	"cf",
	"gq",
	"buzz",
	"rest",
	"cfd",
	"sbs",
	"icu",
	"monster",
	"cyou",
	"lol",
	"quest",
	"bond",
	"shop",
	"online",
	"site",
	"live",
]);

const LOOKALIKE_CHARS: Record<string, string> = {
	"0": "o",
	"1": "l",
	"3": "e",
	"4": "a",
	"5": "s",
	"7": "t",
	"8": "b",
	"9": "g",
	"@": "a",
	$: "s",
	// Cyrillic / Greek homoglyphs that survive punycode decoding
	а: "a",
	е: "e",
	о: "o",
	р: "p",
	с: "c",
	у: "y",
	х: "x",
	і: "i",
	ј: "j",
	ο: "o",
	α: "a",
};

const LURE_WORDS =
	/(secure|security|login|signin|verify|verification|account|support|update|billing|wallet|help|service|alert|auth)/g;

/** "paypa1-secure-login" → "paypal" */
export function normaliseLabel(label: string): string {
	let out = label.toLowerCase();
	out = out.replace(/rn/g, "m").replace(/vv/g, "w");
	out = [...out].map((c) => LOOKALIKE_CHARS[c] ?? c).join("");
	out = out.replace(LURE_WORDS, "");
	return out.replace(/[^a-z]/g, "");
}

export function levenshtein(a: string, b: string): number {
	if (a === b) return 0;
	const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
	for (let i = 1; i <= a.length; i++) {
		let diag = prev[0] ?? 0;
		prev[0] = i;
		for (let j = 1; j <= b.length; j++) {
			const above = prev[j] ?? 0;
			prev[j] = Math.min(
				above + 1,
				(prev[j - 1] ?? 0) + 1,
				diag + (a[i - 1] === b[j - 1] ? 0 : 1),
			);
			diag = above;
		}
	}
	return prev[b.length] ?? 0;
}

/**
 * Returns the brand a domain imitates, or null. The brand's own domain
 * (paypal.com) is not a look-alike; only the registrable label is compared.
 */
export function findLookalikeBrand(
	domain: string,
	brands: readonly string[] = PROTECTED_BRANDS,
): string | null {
	const registrable = getDomain(domain) ?? domain;
	const suffix = getPublicSuffix(domain) ?? "";
	const rawLabel = suffix
		? registrable.slice(0, -(suffix.length + 1))
		: registrable;
	const raw = rawLabel.toLowerCase().replace(/[^a-z]/g, "");
	const label = normaliseLabel(rawLabel);
	if (!label) return null;

	for (const brand of brands) {
		if (raw === brand) return null; // the real brand domain
		// Short brands (dhl, usps) only match exactly to avoid false hits.
		if (brand.length <= 4) {
			if (label === brand) return brand;
			continue;
		}
		if (label === brand) return brand;
		// "paypal-invoices" — substring only for longer brands, so
		// "appletreebakery" is not an Apple look-alike.
		if (brand.length >= 6 && label.includes(brand)) return brand;
		if (levenshtein(label, brand) <= (brand.length >= 8 ? 2 : 1)) return brand;
	}
	return null;
}

/** "xk7q9ffz2" → true, "acmecorp" → false. */
export function looksRandom(label: string): boolean {
	const alnum = label.toLowerCase().replace(/[^a-z0-9]/g, "");
	if (alnum.length < 8) return false;
	const digits = alnum.replace(/[^0-9]/g, "").length;
	const vowels = alnum.replace(/[^aeiouy]/g, "").length;
	return digits / alnum.length > 0.3 || vowels / alnum.length < 0.2;
}

export function scoreDomainRisk({
	domain,
	registeredAt,
	now = new Date(),
	isDisposable,
}: {
	domain: string;
	registeredAt: Date | null;
	now?: Date;
	isDisposable?: (registrable: string) => boolean;
}): DomainRiskSignal[] {
	const signals: DomainRiskSignal[] = [];
	const registrable = (getDomain(domain) ?? domain).toLowerCase();
	const suffix = getPublicSuffix(domain) ?? "";
	const label = suffix
		? registrable.slice(0, -(suffix.length + 1))
		: registrable;

	if (isDisposable?.(registrable)) {
		signals.push({
			id: "disposable_domain",
			points: 40,
			detail: `${registrable} is on the disposable-domain list`,
		});
	}

	const brand = findLookalikeBrand(domain);
	if (brand) {
		signals.push({
			id: "brand_lookalike",
			points: 40,
			detail: `${registrable} imitates "${brand}"`,
		});
	}

	if (registeredAt) {
		const ageDays = Math.floor(
			(now.getTime() - registeredAt.getTime()) / 86_400_000,
		);
		if (ageDays < 7) {
			signals.push({
				id: "domain_age_lt_7d",
				points: 20,
				detail: `Registered ${ageDays} day(s) ago`,
			});
		} else if (ageDays < 30) {
			signals.push({
				id: "domain_age_lt_30d",
				points: 10,
				detail: `Registered ${ageDays} days ago`,
			});
		}
	} else {
		signals.push({
			id: "domain_age_unknown",
			points: 5,
			detail: "Registrar age unknown (RDAP lookup missing)",
		});
	}

	const tld = suffix.split(".").pop() ?? "";
	if (RISKY_TLDS.has(tld)) {
		signals.push({
			id: "risky_tld",
			points: 10,
			detail: `.${tld} has a high abuse rate`,
		});
	}

	if (looksRandom(label)) {
		signals.push({
			id: "random_name",
			points: 10,
			detail: `"${label}" looks machine-generated`,
		});
	}

	return signals;
}
