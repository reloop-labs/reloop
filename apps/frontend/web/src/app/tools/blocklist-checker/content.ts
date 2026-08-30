import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/blocklist-checker";

/** Display names — keep in sync with `dnsbl-providers.ts`. */
export const ipBlocklistNames = [
	"Spamhaus ZEN",
	"Barracuda BRBL",
	"SpamCop SCBL",
	"PSBL (Surriel)",
	"Mailspike BL",
	"Mailspike Z",
	"HostKarma Blacklist",
	"GBUdb Truncate",
	"SpamRATS! All",
	"SpamRATS! Dyna",
	"SpamRATS! NoPtr",
	"Spam Eating Monkey Black",
	"Spam Eating Monkey Backscatter",
	"NordSpam",
	"Blocklist.de",
	"DroneBL",
	"Dan.me.uk Tor List",
	"Dan.me.uk Tor Exit List",
	"Team Cymru Bogons",
	"Fabel.dk Spam Sources",
	"IMP SPAM",
	"InterServer RBL",
	"NoSolicitado DNSBL",
	"RBL JP",
	"s5h.net All",
	"Schulte RBL",
	"Sender Score Reputation Network",
	"Suomispam Reputation",
	"UCEPROTECT Level 1",
	"UCEPROTECT Level 2",
	"ZapBL",
	"0Spam Project",
	"0Spam RBL",
	"Backscatterer",
	"SPFBL",
] as const;

export const domainBlocklistNames = [
	"Spamhaus DBL",
	"URIBL Multi",
	"SURBL Multi",
	"Spam Eating Monkey URIBL",
	"Spam Eating Monkey Fresh",
	"Spam Eating Monkey URIRED",
	"NordSpam DBL",
] as const;

export const ipBlocklistCount = ipBlocklistNames.length;
export const domainBlocklistCount = domainBlocklistNames.length;
export const publicBlocklistCount = ipBlocklistCount + domainBlocklistCount;

export const toolTitle = "IP & Domain DNS Blocklist Checker";
export const siteTitle = toolTitle;
export const metaTitle = toolTitle;
export const metaDescription = `Look up a sending IP or a domain name against ${publicBlocklistCount} public DNS blocklists (${ipBlocklistCount} IP lists, ${domainBlocklistCount} domain URI lists). Failed queries are errors, not a clean pass.`;

export const toolDescription = `Queries ${publicBlocklistCount} public DNS blocklists — ${ipBlocklistCount} for sending IPs, ${domainBlocklistCount} for the domain name itself (DBL, URIBL, SURBL, and similar). This is a DNS lookup, not a website scan, and not Gmail or Microsoft reputation.`;

export const toolKeywords = [
	"email blocklist checker",
	"dnsbl lookup",
	"ip blacklist checker",
	"spamhaus check",
	"barracuda rbl check",
	"rbl lookup",
	"uribl surbl dbl",
];

export const reasons = [
	{
		icon: "shield-check",
		title: `${ipBlocklistCount} IP DNS blocklists`,
		description:
			"Sending IPs are looked up on public zones such as Spamhaus ZEN, Barracuda BRBL, and SpamCop. These are DNS lists, not websites we crawl.",
	},
	{
		icon: "globe",
		title: `${domainBlocklistCount} domain URI lists`,
		description:
			"A domain name is checked on DBL, URIBL, SURBL, and similar URI lists. We do not treat your website or MX host as the sending IP.",
	},
	{
		icon: "alert-triangle",
		title: "Failed queries are not ‘clean’",
		description:
			"Timeouts, SERVFAIL, and refused Spamhaus replies show as errors. Green means the lists that answered returned no hit.",
	},
	{
		icon: "lock",
		title: "No result store",
		description:
			"Lookups are not saved to a database. The IP or domain and the verdict are written to application logs for abuse control.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What does this tool actually check?",
		answer: `It queries ${publicBlocklistCount} public DNS blocklists (DNSBLs): ${ipBlocklistCount} IP lists and ${domainBlocklistCount} domain URI lists. A DNSBL is a DNS zone, not a website. Gmail, Microsoft, and Yahoo keep private reputation we cannot see.`,
	},
	{
		question: "If I enter a domain, are you scanning my website?",
		answer:
			"No. The domain string is looked up on URI/domain blocklists (Spamhaus DBL, URIBL, SURBL, and similar). If SPF publishes dedicated ip4:/ip6: addresses, those sending IPs are also checked. We do not crawl the site or use the MX host as “your mail server.”",
	},
	{
		question: "Why did my IP or domain get listed?",
		answer:
			"Common causes are spam-trap hits, a compromised host, open relays, or a sudden volume spike. A listing is a symptom. Fix the cause before asking a list to remove the entry.",
	},
	{
		question: "How do I get removed from a blocklist?",
		answer:
			"Stop whatever caused the listing, then use that list’s own removal form (linked from a hit in this report). Reloop cannot delist you.",
	},
	{
		question: "Which of these lists matter for deliverability?",
		answer:
			"Spamhaus ZEN (IP) and DBL (domain), Barracuda BRBL, and SpamCop are the public lists most often cited in bounce text. A hit on a low-impact list is not the same as “mail will not send.”",
	},
	{
		question: "Can I automate this via API?",
		answer:
			'Yes. POST https://reloop.sh/api/tools/v1/blocklist-check with JSON {"target":"203.0.113.10"}. No API key. Rate limited to 60 requests per minute per IP.',
	},
];

export const faqGroups = [
	{
		title: "What is checked",
		items: faqs.slice(0, 3),
	},
	{
		title: "Remediation & API",
		items: faqs.slice(3, 6),
	},
];

export const apiResponseSample = `{
  "target": "203.0.113.10",
  "inputType": "ip",
  "ipVersion": "ipv4",
  "resolvedIp": "203.0.113.10",
  "hostname": null,
  "checkedIps": [{ "ip": "203.0.113.10", "source": "input", "version": "ipv4" }],
  "spfIncludes": [],
  "spfRanges": [],
  "ipNote": null,
  "verdict": "clean",
  "isClean": true,
  "totalChecked": ${publicBlocklistCount},
  "listedCount": 0,
  "cleanCount": ${ipBlocklistCount},
  "errorCount": 0,
  "skippedCount": ${domainBlocklistCount},
  "scanDurationMs": 340,
  "results": [
    {
      "id": "spamhaus-zen",
      "name": "Spamhaus ZEN",
      "host": "zen.spamhaus.org",
      "listType": "ip",
      "category": "reputation",
      "impact": "high",
      "status": "not_listed",
      "isListed": false,
      "responseCodes": [],
      "responseTimeMs": 85,
      "delistUrl": "https://check.spamhaus.org",
      "listedTargets": []
    }
  ],
  "recommendations": [
    "No listings on the lists that returned a definitive answer. This is not a guarantee of inbox placement; Gmail, Microsoft, and Yahoo keep private reputation data."
  ]
}`;
