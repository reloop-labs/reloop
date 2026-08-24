export type DnsblCategory = "reputation" | "spam" | "malware" | "domain";
export type DnsblImpact = "high" | "medium" | "low";
export type DnsblListType = "ip" | "domain";

export interface DnsblProvider {
	id: string;
	name: string;
	host: string;
	listType: DnsblListType;
	category: DnsblCategory;
	impact: DnsblImpact;
	supportsIpv4: boolean;
	supportsIpv6: boolean;
	delistUrl: string;
	description: string;
}

/**
 * Email-relevant public DNSBLs only. Overlapping child zones (Spamhaus SBL/XBL/PBL
 * and CBL, SORBS subzones, UCEPROTECT L2/L3) are omitted so a single incident is
 * not counted four times. Keep frontend `content.ts` counts in sync with this catalog.
 */
export const IP_DNSBL_PROVIDERS: DnsblProvider[] = [
	{
		id: "spamhaus-zen",
		name: "Spamhaus ZEN",
		host: "zen.spamhaus.org",
		listType: "ip",
		category: "reputation",
		impact: "high",
		supportsIpv4: true,
		supportsIpv6: true,
		delistUrl: "https://check.spamhaus.org",
		description:
			"Combined SBL, CSS, XBL, and PBL. The most widely used IP DNSBL. Public resolvers are refused; a failed query is inconclusive, not clean.",
	},
	{
		id: "barracuda",
		name: "Barracuda BRBL",
		host: "b.barracudacentral.org",
		listType: "ip",
		category: "spam",
		impact: "high",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://www.barracudacentral.org/rbl/removal-request",
		description:
			"Barracuda Reputation Block List. Unregistered resolver IPs may receive empty replies; treat those as inconclusive, not a pass.",
	},
	{
		id: "spamcop",
		name: "SpamCop SCBL",
		host: "bl.spamcop.net",
		listType: "ip",
		category: "spam",
		impact: "high",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://www.spamcop.net/bl.shtml",
		description:
			"Automated listings from SpamCop user reports. Entries usually expire on their own.",
	},
	{
		id: "sorbs-dnsbl",
		name: "SORBS Aggregate",
		host: "dnsbl.sorbs.net",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "http://www.sorbs.net/delisting",
		description:
			"Spam and Open Relay Blocking System aggregate zone (not the individual SORBS subzones).",
	},
	{
		id: "psbl",
		name: "PSBL (Surriel)",
		host: "psbl.surriel.com",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://psbl.surriel.com/remove",
		description: "Passive Spam Block List of confirmed spam sources.",
	},
	{
		id: "nixspam",
		name: "NiX Spam (Manitu)",
		host: "ix.dnsbl.manitu.net",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://www.dnsbl.manitu.net",
		description: "German real-time DNSBL of high-volume spam sources.",
	},
	{
		id: "mailspike-bl",
		name: "Mailspike BL",
		host: "bl.mailspike.net",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://mailspike.org/iplookup.html",
		description:
			"Mailspike zero-hour IP blocklist. Reputation zones are not queried.",
	},
	{
		id: "hostkarma",
		name: "HostKarma Blacklist",
		host: "hostkarma.junkemailfilter.com",
		listType: "ip",
		category: "reputation",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "http://wiki.junkemailfilter.com/index.php/Hostkarma",
		description:
			"HostKarma IP reputation. 127.0.0.1 is a whitelist (not listed); 127.0.0.2–4 are listings.",
	},
	{
		id: "gbudb-truncate",
		name: "GBUdb Truncate",
		host: "truncate.gbudb.net",
		listType: "ip",
		category: "reputation",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "http://www.gbudb.com/truncate",
		description: "Statistical IP reputation zone used by some filters.",
	},
	{
		id: "spamrats-all",
		name: "SpamRATS! All",
		host: "all.spamrats.com",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://www.spamrats.com/lookup.php",
		description: "SpamRATS combined spam and auth-attack zone.",
	},
	{
		id: "sem-black",
		name: "Spam Eating Monkey Black",
		host: "bl.spameatingmonkey.net",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://spameatingmonkey.com/lookup",
		description: "Listings from trap-mailbox hits.",
	},
	{
		id: "nordspam",
		name: "NordSpam",
		host: "bl.nordspam.com",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://www.nordspam.com/delisting",
		description: "Nordic spam DNSBL.",
	},
	{
		id: "uceprotect-1",
		name: "UCEPROTECT Level 1",
		host: "dnsbl-1.uceprotect.net",
		listType: "ip",
		category: "spam",
		impact: "low",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "http://www.uceprotect.net/en/index.php?m=7",
		description:
			"Level 1 lists individual spam source IPs. Levels 2 and 3 (subnets/ASNs) are omitted — many receivers ignore them and they produce noisy false positives.",
	},
	{
		id: "zero-spam",
		name: "0Spam Project",
		host: "0spam.fusionzero.com",
		listType: "ip",
		category: "spam",
		impact: "low",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://0spam.org",
		description: "Community-run spam source DNSBL.",
	},
	{
		id: "backscatterer",
		name: "Backscatterer",
		host: "ips.backscatterer.org",
		listType: "ip",
		category: "reputation",
		impact: "low",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "http://www.backscatterer.org/?target=removal",
		description:
			"IPs sending misdirected bounces (backscatter), not a general spam-source list. Few mailbox providers use it for inbound filtering.",
	},
	{
		id: "wpbl",
		name: "WPBL",
		host: "db.wpbl.info",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://wpbl.info",
		description:
			"Weighted Private Block List of IPs reported for confirmed spam by participating operators.",
	},
	{
		id: "spfbl",
		name: "SPFBL",
		host: "dnsbl.spfbl.net",
		listType: "ip",
		category: "spam",
		impact: "medium",
		supportsIpv4: true,
		supportsIpv6: false,
		delistUrl: "https://spfbl.net",
		description:
			"Public spam DNSBL used especially in Latin America. Query is the sending IP, not a website.",
	},
];

export const DOMAIN_DNSBL_PROVIDERS: DnsblProvider[] = [
	{
		id: "spamhaus-dbl",
		name: "Spamhaus DBL",
		host: "dbl.spamhaus.org",
		listType: "domain",
		category: "domain",
		impact: "high",
		supportsIpv4: false,
		supportsIpv6: false,
		delistUrl: "https://check.spamhaus.org",
		description:
			"Spamhaus Domain Block List. Query is the domain name, not an IP.",
	},
	{
		id: "uribl-multi",
		name: "URIBL Multi",
		host: "multi.uribl.com",
		listType: "domain",
		category: "domain",
		impact: "high",
		supportsIpv4: false,
		supportsIpv6: false,
		delistUrl: "https://uribl.com",
		description:
			"URI blocklist of domains seen in spam message bodies and links.",
	},
	{
		id: "surbl-multi",
		name: "SURBL Multi",
		host: "multi.surbl.org",
		listType: "domain",
		category: "domain",
		impact: "high",
		supportsIpv4: false,
		supportsIpv6: false,
		delistUrl: "https://www.surbl.org",
		description:
			"SURBL combined URI list of domains found in unsolicited mail.",
	},
	{
		id: "sorbs-rhsbl",
		name: "SORBS RHSBL",
		host: "rhsbl.sorbs.net",
		listType: "domain",
		category: "domain",
		impact: "medium",
		supportsIpv4: false,
		supportsIpv6: false,
		delistUrl: "http://www.sorbs.net/delisting",
		description: "SORBS right-hand-side (domain) blocklist.",
	},
	{
		id: "nordspam-dbl",
		name: "NordSpam DBL",
		host: "dbl.nordspam.com",
		listType: "domain",
		category: "domain",
		impact: "medium",
		supportsIpv4: false,
		supportsIpv6: false,
		delistUrl: "https://www.nordspam.com/delisting",
		description:
			"NordSpam domain blocklist. Queried by domain name, same family as NordSpam’s IP list.",
	},
	{
		id: "sem-uribl",
		name: "Spam Eating Monkey URIBL",
		host: "uribl.spameatingmonkey.net",
		listType: "domain",
		category: "domain",
		impact: "medium",
		supportsIpv4: false,
		supportsIpv6: false,
		delistUrl: "https://spameatingmonkey.com/lookup",
		description:
			"SEM URI blocklist of domains seen in spam. Companion to the SEM IP list.",
	},
];

export const DNSBL_PROVIDERS: DnsblProvider[] = [
	...IP_DNSBL_PROVIDERS,
	...DOMAIN_DNSBL_PROVIDERS,
];

export const IP_DNSBL_COUNT = IP_DNSBL_PROVIDERS.length;
export const DOMAIN_DNSBL_COUNT = DOMAIN_DNSBL_PROVIDERS.length;
export const DNSBL_COUNT = DNSBL_PROVIDERS.length;
