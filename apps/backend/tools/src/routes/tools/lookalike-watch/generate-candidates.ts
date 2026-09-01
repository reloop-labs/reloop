import { getDomain, getPublicSuffix } from "tldts";

export interface CandidateItem {
	name: string; // ASCII / Punycode (e.g. acme-login.com or xn--cme-7cd.com)
	unicodeName: string | null; // e.g. асme.com or null if pure ascii
	trick: "tld" | "affix" | "typo" | "homoglyph";
}

const POPULAR_TLDS = [
	"com",
	"net",
	"org",
	"io",
	"co",
	"app",
	"ai",
	"xyz",
	"info",
	"online",
];

const SUFFIXES = [
	"login",
	"secure",
	"support",
	"pay",
	"account",
	"verify",
	"mail",
	"sso",
];

const PREFIXES = [
	"login",
	"secure",
	"support",
	"pay",
	"verify",
	"mail",
	"sso",
];

// Cyrillic lookalikes mapping for IDN homoglyphs
const CYRILLIC_LOOKALIKES: Record<string, string> = {
	a: "\u0430", // Cyrillic Small Letter A
	e: "\u0435", // Cyrillic Small Letter Ie
	o: "\u043e", // Cyrillic Small Letter O
	c: "\u0441", // Cyrillic Small Letter Es
	p: "\u0440", // Cyrillic Small Letter Er
};

export function generateLookalikeCandidates(
	registrableDomain: string,
	maxCandidates = 70,
): CandidateItem[] {
	const clean = registrableDomain.toLowerCase().trim();
	const tld = getPublicSuffix(clean) || "com";

	// Extract base label (e.g. "acme" from "acme.com" or "acme.co.uk")
	let baseLabel = clean;
	if (clean.endsWith(`.${tld}`)) {
		baseLabel = clean.slice(0, -(tld.length + 1));
	}

	const candidateMap = new Map<string, CandidateItem>();

	const addCandidate = (
		domainName: string,
		trick: CandidateItem["trick"],
		unicodeName: string | null = null,
	) => {
		const lowerAscii = domainName.toLowerCase().trim();
		if (lowerAscii === clean) return; // Omit the original domain
		if (!candidateMap.has(lowerAscii)) {
			candidateMap.set(lowerAscii, {
				name: lowerAscii,
				unicodeName,
				trick,
			});
		}
	};

	// 1. TLD Swaps
	for (const altTld of POPULAR_TLDS) {
		if (altTld !== tld) {
			addCandidate(`${baseLabel}.${altTld}`, "tld");
		}
	}

	// 2. Affixes (Hyphenated Prefix & Suffix)
	for (const sfx of SUFFIXES) {
		addCandidate(`${baseLabel}-${sfx}.${tld}`, "affix");
	}
	for (const pfx of PREFIXES) {
		addCandidate(`${pfx}-${baseLabel}.${tld}`, "affix");
	}

	// 3. Typos
	const chars = baseLabel.split("");

	// Omission (drop letter if baseLabel > 3)
	if (baseLabel.length > 3) {
		for (let i = 0; i < chars.length; i++) {
			const omitted = chars.slice(0, i).concat(chars.slice(i + 1)).join("");
			addCandidate(`${omitted}.${tld}`, "typo");
		}
	}

	// Duplication (duplicate letter)
	for (let i = 0; i < chars.length; i++) {
		const duplicated =
			chars.slice(0, i + 1).join("") +
			chars[i] +
			chars.slice(i + 1).join("");
		addCandidate(`${duplicated}.${tld}`, "typo");
	}

	// Adjacent Transposition (swap adjacent characters)
	for (let i = 0; i < chars.length - 1; i++) {
		const swapped = [...chars];
		const tmp = swapped[i]!;
		swapped[i] = swapped[i + 1]!;
		swapped[i + 1] = tmp;
		addCandidate(`${swapped.join("")}.${tld}`, "typo");
	}

	// 4. Homoglyphs
	// m <-> rn
	if (baseLabel.includes("m")) {
		addCandidate(`${baseLabel.replace(/m/g, "rn")}.${tld}`, "homoglyph");
	}
	if (baseLabel.includes("rn")) {
		addCandidate(`${baseLabel.replace(/rn/g, "m")}.${tld}`, "homoglyph");
	}

	// l <-> 1 or i
	if (baseLabel.includes("l")) {
		addCandidate(`${baseLabel.replace(/l/g, "1")}.${tld}`, "homoglyph");
		addCandidate(`${baseLabel.replace(/l/g, "i")}.${tld}`, "homoglyph");
	}

	// o <-> 0
	if (baseLabel.includes("o")) {
		addCandidate(`${baseLabel.replace(/o/g, "0")}.${tld}`, "homoglyph");
	}

	// Cyrillic IDN Homoglyphs (replace first replaceable vowel)
	for (let i = 0; i < chars.length; i++) {
		const c = chars[i]!;
		if (CYRILLIC_LOOKALIKES[c]) {
			const unicodeChars = [...chars];
			unicodeChars[i] = CYRILLIC_LOOKALIKES[c]!;
			const unicodeDomain = `${unicodeChars.join("")}.${tld}`;
			try {
				const asciiDomain = new URL(`http://${unicodeDomain}`).hostname;
				if (asciiDomain.startsWith("xn--")) {
					addCandidate(asciiDomain, "homoglyph", unicodeDomain);
				}
			} catch {
				// Ignore punycode conversion errors
			}
		}
	}

	return Array.from(candidateMap.values()).slice(0, maxCandidates);
}
