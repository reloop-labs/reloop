import { getPublicSuffix } from "tldts";

const IDENTITY_DIGITAL = "https://rdap.identitydigital.services/rdap/domain/";
const COCCA = "https://rdap.coccaregistry.org/domain/";
const AFNIC = "https://rdap.nic.fr/domain/";
const CENTRALNIC = (tld: string) =>
	`https://rdap.centralnic.com/${tld}/domain/`;

/**
 * Authoritative RDAP bases for TLDs that often never appear in IANA's
 * bootstrap (https://data.iana.org/rdap/dns.json) or on rdap.org.
 * Keys are public-suffix labels, lowercase, no leading dot.
 * Values are registry bases that already include the `/domain` path, or a
 * host root — `joinRdapDomainUrl` normalizes either shape.
 */
export const RDAP_REGISTRY_BASES: Record<string, string> = {
	// Identity Digital / Afilias ccTLDs (missing from IANA bootstrap)
	ac: IDENTITY_DIGITAL,
	ag: IDENTITY_DIGITAL,
	au: IDENTITY_DIGITAL,
	bz: IDENTITY_DIGITAL,
	gi: IDENTITY_DIGITAL,
	io: IDENTITY_DIGITAL,
	lc: IDENTITY_DIGITAL,
	me: IDENTITY_DIGITAL,
	mn: IDENTITY_DIGITAL,
	mu: IDENTITY_DIGITAL,
	pr: IDENTITY_DIGITAL,
	sc: IDENTITY_DIGITAL,
	sh: IDENTITY_DIGITAL,
	vc: IDENTITY_DIGITAL,

	// CoCCA
	af: COCCA,
	gy: COCCA,
	hn: COCCA,
	ht: COCCA,
	ki: COCCA,
	ms: COCCA,
	nf: COCCA,
	sb: COCCA,
	tl: COCCA,

	// CentralNic
	bh: CENTRALNIC("bh"),
	fm: CENTRALNIC("fm"),
	fo: CENTRALNIC("fo"),
	gd: CENTRALNIC("gd"),
	pw: CENTRALNIC("pw"),
	vg: CENTRALNIC("vg"),

	// AFNIC
	fr: AFNIC,
	pm: "https://rdap.nic.pm/domain/",
	re: "https://rdap.nic.re/domain/",
	tf: "https://rdap.nic.tf/domain/",
	wf: "https://rdap.nic.wf/domain/",
	yt: "https://rdap.nic.yt/domain/",

	// National registries
	ad: "https://rdap.nic.ad/domain/",
	ai: "https://rdap.whois.ai/domain/",
	ar: "https://rdap.nic.ar/domain/",
	br: "https://rdap.registro.br/domain/",
	bw: "https://rdap.nic.net.bw/domain/",
	ca: "https://rdap.ca.fury.ca/domain/",
	cc: "https://tld-rdap.verisign.com/cc/v1/domain/",
	ch: "https://rdap.nic.ch/domain/",
	ci: "https://rdap.nic.ci/domain/",
	co: "https://rdap.registry.co/co/domain/",
	cr: "https://rdap.nic.cr/domain/",
	cv: "https://rdap.nic.cv/domain/",
	cx: "https://rdap.nic.cx/domain/",
	cz: "https://rdap.nic.cz/domain/",
	de: "https://rdap.denic.de/domain/",
	dm: "https://rdap.dmdomains.dm/rdap/domain/",
	ec: "https://rdap.registry.ec/domain/",
	fi: "https://rdap.fi/rdap/rdap/domain/",
	ga: "https://rdap.nic.ga/domain/",
	gs: "https://rdap.nic.gs/domain/",
	id: "https://rdap.pandi.id/rdap/domain/",
	in: "https://rdap.registry.in/domain/",
	is: "https://rdap.isnic.is/domain/",
	ke: "https://rdap.kenic.or.ke/domain/",
	ky: "https://whois.kyregistry.ky/rdap/domain/",
	kz: "https://rdap.nic.kz/domain/",
	lb: "https://rdap.lbdr.org.lb/domain/",
	li: "https://rdap.nic.li/domain/",
	mr: "https://rdap.nic.mr/domain/",
	mz: "https://rdap.nic.mz/domain/",
	nl: "https://rdap.sidn.nl/domain/",
	no: "https://rdap.norid.no/domain/",
	om: "https://rdap.registry.om/domain/",
	pn: "https://rdap.nominet.uk/pn/domain/",
	ru: "https://cctld.ru/tci-ripn-rdap/domain/",
	sd: "https://rdap.nic.sd/domain/",
	sg: "https://rdap.sgnic.sg/rdap/domain/",
	si: "https://rdap.register.si/domain/",
	sn: "https://rdap.nic.sn/domain/",
	so: "https://rdap.nic.so/domain/",
	ss: "https://rdap.nic.ss/domain/",
	td: "https://rdap.nic.td/domain/",
	th: "https://rdap.thains.co.th/domain/",
	to: "https://rdap.tonicregistry.to/rdap/domain/",
	tv: "https://rdap.nic.tv/domain/",
	tz: "https://whois.tznic.or.tz/rdap/domain/",
	ua: "https://rdap.hostmaster.ua/domain/",
	uk: "https://rdap.nominet.uk/uk/domain/",
	us: "https://rdap.nic.us/domain/",
	uz: "https://rdap.cctld.uz/domain/",
	ve: "https://rdap.nic.ve/rdap/domain/",
	vi: "https://rdap.nic.vi/domain/",
	ws: "https://rdap.website.ws/domain/",
	zm: "https://rdap.nic.zm/domain/",
};

export function joinRdapDomainUrl(base: string, domain: string): string {
	const trimmed = base.trim().replace(/\/+$/, "");
	const encoded = encodeURIComponent(domain.toLowerCase());
	if (/\/domain$/i.test(trimmed)) {
		return `${trimmed}/${encoded}`;
	}
	return `${trimmed}/domain/${encoded}`;
}

/** Public suffix first (co.uk), then the parent ccTLD (uk). */
export function rdapTldCandidates(registrableDomain: string): string[] {
	const domain = registrableDomain.toLowerCase();
	const suffix = (getPublicSuffix(domain) || domain.split(".").pop() || "")
		.toLowerCase()
		.replace(/^\.+/, "");
	const last = domain.split(".").pop() || suffix;
	const out: string[] = [];
	for (const label of [suffix, last]) {
		if (label && !out.includes(label)) out.push(label);
	}
	return out;
}

export function catalogBaseForDomain(registrableDomain: string): string | null {
	for (const tld of rdapTldCandidates(registrableDomain)) {
		const base = RDAP_REGISTRY_BASES[tld];
		if (base) return base;
	}
	return null;
}

export function nicHeuristicBase(registrableDomain: string): string | null {
	const tld = rdapTldCandidates(registrableDomain).at(-1);
	if (!tld || tld.includes(".")) return null;
	return `https://rdap.nic.${tld}/`;
}

export function bootstrapBaseForDomain(
	registrableDomain: string,
	bootstrap: Map<string, string> | Record<string, string>,
): string | null {
	const get =
		bootstrap instanceof Map
			? (key: string) => bootstrap.get(key)
			: (key: string) => bootstrap[key];

	for (const tld of rdapTldCandidates(registrableDomain)) {
		const base = get(tld);
		if (base) return base;
	}
	return null;
}

export function rdapEndpointsForDomain(
	registrableDomain: string,
	options?: { bootstrap?: Map<string, string> | Record<string, string> },
): string[] {
	const domain = registrableDomain.toLowerCase();
	const urls: string[] = [];
	const seen = new Set<string>();

	const push = (base: string | null) => {
		if (!base) return;
		const url = joinRdapDomainUrl(base, domain);
		if (seen.has(url)) return;
		seen.add(url);
		urls.push(url);
	};

	push(catalogBaseForDomain(domain));
	if (options?.bootstrap) {
		push(bootstrapBaseForDomain(domain, options.bootstrap));
	}

	if (urls.length === 0) {
		push(nicHeuristicBase(domain));
	}

	push("https://rdap.org/");
	return urls;
}
