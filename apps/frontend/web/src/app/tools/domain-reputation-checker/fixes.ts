import type { DomainReputationResponse } from "./check-api";

export type DnsRecord = {
	type: "TXT" | "MX" | "CNAME";
	host: string;
	value: string;
};

export type Fix = {
	id: string;
	severity: "fail" | "warn";
	title: string;
	why: string;
	/** Copy-paste records. Values with `<...>` are placeholders to fill in. */
	records: DnsRecord[];
	/** Follow-up when a record alone can't fix it. */
	steps?: string[];
	link?: { href: string; label: string };
};

/** Parses `k=v; k=v` tag lists (DMARC, DKIM). Keys are lower-cased. */
export function parseTags(record: string): Map<string, string> {
	const tags = new Map<string, string>();
	for (const part of record.split(";")) {
		const eq = part.indexOf("=");
		if (eq === -1) continue;
		const key = part.slice(0, eq).trim().toLowerCase();
		if (key) tags.set(key, part.slice(eq + 1).trim());
	}
	return tags;
}

function dmarcRecord(domain: string, policy: string, existing?: string) {
	const tags = existing ? parseTags(existing) : new Map<string, string>();
	const rua = tags.get("rua") ?? `mailto:dmarc@${domain}`;
	const parts = ["v=DMARC1", `p=${policy}`, "pct=100", `rua=${rua}`];
	for (const key of ["ruf", "sp", "adkim", "aspf", "fo"]) {
		const value = tags.get(key);
		// sp=none leaves subdomains spoofable, so it never survives an upgrade.
		if (value && !(key === "sp" && value.toLowerCase() === "none")) {
			parts.push(`${key}=${value}`);
		}
	}
	return parts.join("; ");
}

function spfWithSoftfail(record: string) {
	return /[+?]?all\s*$/i.test(record)
		? record.replace(/[+?]?all\s*$/i, "~all")
		: `${record.trim()} ~all`;
}

export function buildFixes(result: DomainReputationResponse): Fix[] {
	const { domain, details } = result;
	const { spf, dkim, dmarc } = details.authentication;
	const fixes: Fix[] = [];

	if (!spf.exists) {
		fixes.push({
			id: "spf-missing",
			severity: "fail",
			title: "Publish an SPF record",
			why: "Without SPF, receivers can't tell which servers may send for your domain. iCloud requires it of every sender, and Gmail, Yahoo, and Outlook require it for bulk senders.",
			records: [
				{
					type: "TXT",
					host: "@",
					value: "v=spf1 include:<your-email-provider> ~all",
				},
			],
			steps: [
				"Replace <your-email-provider> with the include your provider gives you (e.g. _spf.google.com for Google Workspace).",
				"Keep one SPF record per domain. Merge includes into it instead of adding a second.",
			],
		});
	} else if (spf.record && /[+?]all\s*$/i.test(spf.record)) {
		fixes.push({
			id: "spf-qualifier",
			severity: spf.record.trim().endsWith("+all") ? "fail" : "warn",
			title: "Tighten your SPF record",
			why: "Your SPF ends in +all or ?all, which lets any server pass as you. ~all marks unknown senders as suspicious.",
			records: [{ type: "TXT", host: "@", value: spfWithSoftfail(spf.record) }],
		});
	}

	if (!dkim.detected) {
		fixes.push({
			id: "dkim-missing",
			severity: "fail",
			title: "Turn on DKIM signing",
			why: "DKIM signs every message so receivers can prove it wasn't forged or changed. Gmail, Yahoo, and Outlook require it for bulk senders, and iCloud requires it of everyone.",
			records: [
				{
					type: "TXT",
					host: "<selector>._domainkey",
					value: "v=DKIM1; k=rsa; p=<public-key-from-your-provider>",
				},
			],
			steps: [
				"Enable DKIM in your email provider's admin panel. It generates the key and tells you the selector.",
				"Some providers give you CNAME records instead of a TXT key. Add exactly what they show.",
				"We only detect common selectors, so if you already sign with a custom selector this may be a false alarm.",
			],
		});
	}

	if (!dmarc.exists) {
		fixes.push({
			id: "dmarc-missing",
			severity: "fail",
			title: "Publish a DMARC record",
			why: "DMARC tells receivers what to do with mail that fails SPF and DKIM. Without it anyone can spoof your domain. Gmail, Yahoo, and Outlook require it for bulk senders, and iCloud requires it of everyone.",
			records: [
				{ type: "TXT", host: "_dmarc", value: dmarcRecord(domain, "none") },
			],
			steps: [
				"Start at p=none to collect reports without affecting delivery.",
				"After 2–4 weeks of clean reports, move to p=quarantine, then p=reject.",
			],
		});
	} else if (dmarc.policy?.toLowerCase() === "none") {
		fixes.push({
			id: "dmarc-enforce",
			severity: "warn",
			title: "Enforce your DMARC policy",
			why: "p=none only monitors. Forged mail from your domain is still delivered until you quarantine or reject it.",
			records: [
				{
					type: "TXT",
					host: "_dmarc",
					value: dmarcRecord(domain, "quarantine", dmarc.record),
				},
			],
			steps: [
				"Check your DMARC reports first: every service that sends as you should pass SPF or DKIM.",
				"Once quarantine runs cleanly, switch p=quarantine to p=reject.",
			],
		});
	} else if (dmarc.pct !== undefined && dmarc.pct < 100) {
		fixes.push({
			id: "dmarc-pct",
			severity: "warn",
			title: "Apply DMARC to all mail",
			why: `pct=${dmarc.pct} applies your policy to only ${dmarc.pct}% of failing mail. The rest is delivered as if you had no policy.`,
			records: [
				{
					type: "TXT",
					host: "_dmarc",
					value: dmarcRecord(
						domain,
						dmarc.policy ?? "quarantine",
						dmarc.record,
					),
				},
			],
		});
	}

	const listed = details.blocklist.listings.filter((l) => l.listed);
	if (listed.length > 0) {
		fixes.push({
			id: "blocklisted",
			severity: "fail",
			title: `Get delisted from ${listed.length === 1 && listed[0] ? listed[0].name : `${listed.length} blocklists`}`,
			why: "Receivers that query these lists may reject or junk mail containing your domain.",
			records: [],
			steps: [
				"Find and stop the cause first: a compromised account, purchased lists, or a spike in complaints.",
				`Then request removal from each list's own site: ${listed.map((l) => l.name).join(", ")}.`,
			],
			link: {
				href: "/tools/blocklist-checker",
				label: "Check IP blocklists too",
			},
		});
	}

	const age = details.domainAge;
	if (age.tier === "new" || age.tier === "young") {
		fixes.push({
			id: "young-domain",
			severity: "warn",
			title: "Warm up this new domain",
			why: `${age.ageDays !== undefined ? `At ${age.ageDays} days old, this` : "This"} domain has no sending history, so mailbox providers filter it harder.`,
			records: [],
			steps: [
				"Start with small daily volumes to your most engaged recipients and grow gradually.",
				"Keep bounces and complaints low while volume ramps up.",
			],
			link: { href: "/tools/domain-age", label: "See your warmup stage" },
		});
	}

	if (details.dnsHealth.mxRecords.length === 0) {
		fixes.push({
			id: "mx-missing",
			severity: "warn",
			title: "Add an MX record",
			why: "Without MX records your domain can't receive replies or bounces, which receivers read as a sign of a throwaway sender.",
			records: [{ type: "MX", host: "@", value: "10 <your-mail-server>" }],
		});
	}

	return fixes.sort((a, b) =>
		a.severity === b.severity ? 0 : a.severity === "fail" ? -1 : 1,
	);
}

type Rule = "spf" | "dkim" | "dmarc" | "spf-or-dkim";

type ProviderRules = {
	id: string;
	name: string;
	/** DNS rules for everyone who sends to this provider. Empty: none published. */
	all: Rule[];
	/** DNS rules once you send 5,000+ messages a day to this provider. */
	bulk: Rule[];
};

/**
 * Published sender requirements, limited to what DNS can prove.
 * Gmail and Yahoo: Feb 2024. Outlook.com: May 2025. iCloud Mail: Apple's
 * postmaster page, which requires SPF, DKIM, and DMARC of every sender.
 */
const PROVIDERS: ProviderRules[] = [
	{
		id: "gmail",
		name: "Gmail",
		all: ["spf-or-dkim"],
		bulk: ["spf", "dkim", "dmarc"],
	},
	{
		id: "yahoo",
		name: "Yahoo & AOL",
		all: ["spf-or-dkim"],
		bulk: ["spf", "dkim", "dmarc"],
	},
	{
		id: "outlook",
		name: "Outlook & Hotmail",
		all: [],
		bulk: ["spf", "dkim", "dmarc"],
	},
	{
		id: "icloud",
		name: "Apple iCloud",
		all: ["spf", "dkim", "dmarc"],
		bulk: ["spf", "dkim", "dmarc"],
	},
];

export type TierResult =
	| { status: "pass" }
	| { status: "fail"; missing: string[] }
	/** The provider publishes no DNS rule for this tier. */
	| { status: "none" };

export type ProviderReadiness = {
	id: string;
	name: string;
	all: TierResult;
	bulk: TierResult;
};

export function buildProviderReadiness(
	result: DomainReputationResponse,
): ProviderReadiness[] {
	const { spf, dkim, dmarc } = result.details.authentication;
	const has = {
		spf: spf.exists && spf.status !== "fail",
		dkim: dkim.detected,
		dmarc: dmarc.exists,
	};

	const missingFor = (rule: Rule): string[] => {
		if (rule === "spf-or-dkim")
			return has.spf || has.dkim ? [] : ["SPF or DKIM"];
		return has[rule] ? [] : [rule.toUpperCase()];
	};

	const evaluate = (rules: Rule[]): TierResult => {
		if (rules.length === 0) return { status: "none" };
		const missing = rules.flatMap(missingFor);
		return missing.length === 0
			? { status: "pass" }
			: { status: "fail", missing };
	};

	return PROVIDERS.map((provider) => ({
		id: provider.id,
		name: provider.name,
		all: evaluate(provider.all),
		bulk: evaluate(provider.bulk),
	}));
}

/** Rules every provider applies that only a real message (or Postmaster Tools) can show. */
export const MESSAGE_LEVEL_RULES = [
	{
		label: "DMARC alignment",
		detail: "Your From domain must match the SPF or DKIM domain.",
	},
	{
		label: "Reverse DNS on sending IPs",
		detail: "Set by whoever runs the servers that send your mail.",
	},
	{
		label: "Unsubscribe",
		detail:
			"Marketing mail needs a working unsubscribe; Gmail and Yahoo require one-click.",
	},
	{
		label: "Low spam complaints",
		detail:
			"Gmail and Yahoo expect under 0.3%, visible in their postmaster tools.",
	},
];
