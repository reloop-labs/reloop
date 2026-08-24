import dns from "node:dns/promises";
import net from "node:net";

export interface DnsblProvider {
	id: string;
	name: string;
	host: string;
	category: "reputation" | "spam" | "phishing" | "malware" | "open_relay";
	delistUrl: string;
	description: string;
}

export interface DnsblCheckItemResult {
	id: string;
	name: string;
	host: string;
	category: "reputation" | "spam" | "phishing" | "malware" | "open_relay";
	isListed: boolean;
	responseCodes: string[];
	responseTimeMs: number;
	delistUrl: string;
	description: string;
	error?: string;
}

export interface BlocklistCheckResult {
	target: string;
	inputType: "domain" | "ip";
	resolvedIp: string | null;
	hostname: string | null;
	isClean: boolean;
	totalChecked: number;
	listedCount: number;
	cleanCount: number;
	scanDurationMs: number;
	results: DnsblCheckItemResult[];
	recommendations: string[];
}

export const DNSBL_PROVIDERS: DnsblProvider[] = [
	{
		id: "spamhaus-zen",
		name: "Spamhaus ZEN",
		host: "zen.spamhaus.org",
		category: "reputation",
		delistUrl: "https://check.spamhaus.org",
		description:
			"Spamhaus ZEN combines SBL, CSS, XBL, and PBL data into a single query zone.",
	},
	{
		id: "spamhaus-sbl",
		name: "Spamhaus SBL",
		host: "sbl.spamhaus.org",
		category: "spam",
		delistUrl: "https://check.spamhaus.org",
		description: "Spamhaus verified spam origins and known spam operations.",
	},
	{
		id: "spamhaus-xbl",
		name: "Spamhaus XBL",
		host: "xbl.spamhaus.org",
		category: "malware",
		delistUrl: "https://check.spamhaus.org",
		description: "Spamhaus exploits, botnets, and worm-infected zombie machines.",
	},
	{
		id: "spamhaus-pbl",
		name: "Spamhaus PBL",
		host: "pbl.spamhaus.org",
		category: "open_relay",
		delistUrl: "https://check.spamhaus.org",
		description: "End-user dynamic IP space that should not send direct-to-MX email.",
	},
	{
		id: "barracuda",
		name: "Barracuda BRBL",
		host: "b.barracudacentral.org",
		category: "spam",
		delistUrl: "https://www.barracudacentral.org/rbl/removal-request",
		description:
			"Barracuda Reputation Block List tracks spam and malware sending sources.",
	},
	{
		id: "spamcop",
		name: "SpamCop SCBL",
		host: "bl.spamcop.net",
		category: "spam",
		delistUrl: "https://www.spamcop.net/bl.shtml",
		description:
			"SpamCop Blocking List based on real-time automated user spam reporting.",
	},
	{
		id: "sorbs-dnsbl",
		name: "SORBS Aggregate",
		host: "dnsbl.sorbs.net",
		category: "reputation",
		delistUrl: "http://www.sorbs.net/delisting",
		description: "Spam and Open Relay Blocking System aggregate database.",
	},
	{
		id: "sorbs-spam",
		name: "SORBS Spam",
		host: "spam.dnsbl.sorbs.net",
		category: "spam",
		delistUrl: "http://www.sorbs.net/delisting",
		description: "SORBS verified spam source hosts and repeat offenders.",
	},
	{
		id: "sorbs-socks",
		name: "SORBS SOCKS",
		host: "socks.dnsbl.sorbs.net",
		category: "open_relay",
		delistUrl: "http://www.sorbs.net/delisting",
		description: "Open SOCKS proxies vulnerable to unauthorized mail relaying.",
	},
	{
		id: "sorbs-http",
		name: "SORBS HTTP Proxy",
		host: "http.dnsbl.sorbs.net",
		category: "open_relay",
		delistUrl: "http://www.sorbs.net/delisting",
		description: "Open HTTP CONNECT proxies tested for spam relaying.",
	},
	{
		id: "sorbs-misc",
		name: "SORBS Misc",
		host: "misc.dnsbl.sorbs.net",
		category: "open_relay",
		delistUrl: "http://www.sorbs.net/delisting",
		description: "Miscellaneous open proxy and vulnerable relay servers.",
	},
	{
		id: "sorbs-smtp",
		name: "SORBS Open SMTP",
		host: "smtp.dnsbl.sorbs.net",
		category: "open_relay",
		delistUrl: "http://www.sorbs.net/delisting",
		description: "Open mail servers that relay unauthenticated outbound mail.",
	},
	{
		id: "abuseat-cbl",
		name: "Abuseat CBL",
		host: "cbl.abuseat.org",
		category: "malware",
		delistUrl: "https://www.abuseat.org/lookup.cgi",
		description:
			"Composite Blocking List tracking infected botnet and spammer IPs.",
	},
	{
		id: "backscatterer",
		name: "Backscatterer",
		host: "ips.backscatterer.org",
		category: "reputation",
		delistUrl: "http://www.backscatterer.org/?target=removal",
		description:
			"Identifies servers sending misdirected bounces and autoresponders.",
	},
	{
		id: "mailspike-bl",
		name: "Mailspike BL",
		host: "bl.mailspike.net",
		category: "spam",
		delistUrl: "https://mailspike.org/iplookup.html",
		description: "Mailspike zero-hour real-time IP blackhole list.",
	},
	{
		id: "mailspike-rep",
		name: "Mailspike Reputation",
		host: "rep.mailspike.net",
		category: "reputation",
		delistUrl: "https://mailspike.org/iplookup.html",
		description: "Mailspike distributed IP reputation classifier.",
	},
	{
		id: "uceprotect-1",
		name: "UCEPROTECT Level 1",
		host: "dnsbl-1.uceprotect.net",
		category: "spam",
		delistUrl: "http://www.uceprotect.net/en/index.php?m=7",
		description: "Direct spam source IP addresses within the last 7 days.",
	},
	{
		id: "uceprotect-2",
		name: "UCEPROTECT Level 2",
		host: "dnsbl-2.uceprotect.net",
		category: "spam",
		delistUrl: "http://www.uceprotect.net/en/index.php?m=7",
		description: "Subnets and allocations with high spam density.",
	},
	{
		id: "uceprotect-3",
		name: "UCEPROTECT Level 3",
		host: "dnsbl-3.uceprotect.net",
		category: "reputation",
		delistUrl: "http://www.uceprotect.net/en/index.php?m=7",
		description: "Entire autonomous systems (ASNs) with persistent spam issues.",
	},
	{
		id: "dronebl",
		name: "DroneBL",
		host: "dnsbl.dronebl.org",
		category: "open_relay",
		delistUrl: "https://dronebl.org/lookup",
		description:
			"Real-time blocklist for open proxies, botnets, and worm infected hosts.",
	},
	{
		id: "nordspam",
		name: "NordSpam",
		host: "bl.nordspam.com",
		category: "spam",
		delistUrl: "https://www.nordspam.com/delisting",
		description: "Nordic spam detection engine and real-time blocklist.",
	},
	{
		id: "blocklist-de",
		name: "Blocklist.de",
		host: "bl.blocklist.de",
		category: "malware",
		delistUrl: "https://www.blocklist.de/en/search.html",
		description: "Automated Fail2ban intrusion and attack reporting database.",
	},
	{
		id: "gbudb-truncate",
		name: "GBUdb Truncate",
		host: "truncate.gbudb.net",
		category: "reputation",
		delistUrl: "http://www.gbudb.com/truncate",
		description: "Statistical IP reputation database updated in real-time.",
	},
	{
		id: "psbl",
		name: "PSBL (Surriel)",
		host: "psbl.surriel.com",
		category: "spam",
		delistUrl: "https://psbl.surriel.com/remove",
		description:
			"Passive Spam Block List focused exclusively on pure spam sources.",
	},
	{
		id: "spamrats-all",
		name: "SpamRATS! All",
		host: "all.spamrats.com",
		category: "spam",
		delistUrl: "https://www.spamrats.com/lookup.php",
		description: "Real-time threat engine tracking brute-force bots and spam origins.",
	},
	{
		id: "sem-black",
		name: "Spam Eating Monkey Black",
		host: "bl.spameatingmonkey.net",
		category: "spam",
		delistUrl: "https://spameatingmonkey.com/lookup",
		description: "Monitors senders sending to trap mailboxes in real-time.",
	},
	{
		id: "sem-net",
		name: "Spam Eating Monkey Net",
		host: "netbl.spameatingmonkey.net",
		category: "reputation",
		delistUrl: "https://spameatingmonkey.com/lookup",
		description: "Network-wide reputation tracking for spam-heavy subnets.",
	},
	{
		id: "hostkarma",
		name: "HostKarma Blacklist",
		host: "hostkarma.junkemailfilter.com",
		category: "reputation",
		delistUrl: "http://wiki.junkemailfilter.com/index.php/Hostkarma",
		description: "Automated real-time IP reputation tracking.",
	},
	{
		id: "wpbl",
		name: "WPBL (Weighted Private)",
		host: "db.wpbl.info",
		category: "reputation",
		delistUrl: "https://wpbl.info",
		description:
			"Weighted reputation list based on confirmed spam delivery reports.",
	},
	{
		id: "interserver",
		name: "InterServer RBL",
		host: "rbl.interserver.net",
		category: "spam",
		delistUrl: "https://rbl.interserver.net",
		description: "Real-time blacklist maintained across web hosting clusters.",
	},
	{
		id: "fabel",
		name: "Fabel SpamSources",
		host: "spamsources.fabel.dk",
		category: "spam",
		delistUrl: "http://www.fabel.dk/spam",
		description: "Monitors verified spam origins and automated email scanners.",
	},
	{
		id: "s5h-all",
		name: "S5h All-in-One",
		host: "all.s5h.net",
		category: "reputation",
		delistUrl: "http://www.s5h.net",
		description: "Combined real-time DNSBL zone tracking spam and open relays.",
	},
	{
		id: "zapbl",
		name: "ZapBL DNSBL",
		host: "dnsbl.zapbl.net",
		category: "spam",
		delistUrl: "https://zapbl.net",
		description: "Aggressive real-time anti-spam and malicious bot network tracker.",
	},
	{
		id: "kempt",
		name: "Kempt DNSBL",
		host: "dnsbl.kempt.net",
		category: "spam",
		delistUrl: "http://kempt.net/dnsbl",
		description: "Real-time tracker for automated commercial spam engines.",
	},
	{
		id: "suomispam",
		name: "SuomiSpam BL",
		host: "bl.suomispam.net",
		category: "spam",
		delistUrl: "https://suomispam.net/delist",
		description: "Automated real-time spam reporter and trap monitoring network.",
	},
	{
		id: "nixspam",
		name: "NiX Spam (Manitu)",
		host: "ix.dnsbl.manitu.net",
		category: "spam",
		delistUrl: "http://www.dnsbl.manitu.net",
		description: "German real-time DNSBL monitoring high-volume spam operations.",
	},
	{
		id: "virbl",
		name: "VirBL Antivirus",
		host: "virbl.dnsbl.bit.nl",
		category: "malware",
		delistUrl: "http://virbl.bit.nl",
		description: "IP addresses observed sending infected attachments and viruses.",
	},
	{
		id: "dan-tor",
		name: "Dan.me.uk Tor Exits",
		host: "tor.dan.me.uk",
		category: "open_relay",
		delistUrl: "https://www.dan.me.uk/torlist",
		description: "Live list of active Tor network exit nodes.",
	},
	{
		id: "efnet-rbl",
		name: "EFnet RBL",
		host: "rbl.efnetrbl.org",
		category: "open_relay",
		delistUrl: "http://rbl.efnetrbl.org",
		description: "Tracks open proxies, infected hosts, and botnets across IRC.",
	},
	{
		id: "calivent",
		name: "Calivent DNSBL",
		host: "dnsbl.calivent.com.pe",
		category: "spam",
		delistUrl: "http://dnsbl.calivent.com.pe",
		description: "Latin American and global spam source tracking network.",
	},
	{
		id: "imp-spam",
		name: "IMP Spam RBL",
		host: "spamrbl.imp.ch",
		category: "spam",
		delistUrl: "http://www.imp.ch",
		description: "Swiss internet provider real-time anti-spam database.",
	},
	{
		id: "imp-worm",
		name: "IMP Worm RBL",
		host: "wormrbl.imp.ch",
		category: "malware",
		delistUrl: "http://www.imp.ch",
		description: "IP addresses propagating worms and malicious automated scripts.",
	},
	{
		id: "megarbl",
		name: "MegaRBL",
		host: "rbl.megarbl.net",
		category: "spam",
		delistUrl: "http://www.megarbl.net",
		description: "Real-time blocklist tracking aggressive spam networks.",
	},
	{
		id: "0spam",
		name: "0Spam Project",
		host: "0spam.fusionzero.com",
		category: "spam",
		delistUrl: "https://0spam.org",
		description: "Community-driven real-time blocklist for fraudulent senders.",
	},
	{
		id: "swinog",
		name: "SwinOG RBL",
		host: "dnsrbl.swinog.ch",
		category: "spam",
		delistUrl: "http://swinog.ch",
		description: "Swiss Network Operators Group distributed anti-spam RBL.",
	},
	{
		id: "tiopan",
		name: "Tiopan Spam Filter",
		host: "bl.tiopan.com",
		category: "spam",
		delistUrl: "http://www.tiopan.com",
		description: "Real-time reputation filter tracking unsolicited mail sources.",
	},
	{
		id: "drmx",
		name: "DRMX Filter",
		host: "bl.drmx.org",
		category: "spam",
		delistUrl: "http://www.drmx.org",
		description: "Automated honeypot detection for high-velocity spam.",
	},
	{
		id: "rvsoft",
		name: "RV-Soft DNSBL",
		host: "dnsbl.rv-soft.info",
		category: "spam",
		delistUrl: "http://www.rv-soft.info",
		description: "European anti-spam and security scanning database.",
	},
	{
		id: "redhawk",
		name: "Redhawk Access",
		host: "access.redhawk.org",
		category: "reputation",
		delistUrl: "http://access.redhawk.org",
		description: "Real-time access reputation database for email sending servers.",
	},
	{
		id: "rbldns-ru",
		name: "RBLDNS Network",
		host: "rbl.rbldns.ru",
		category: "spam",
		delistUrl: "http://rbldns.ru",
		description: "Eastern European and global spam trap monitoring network.",
	},
];

/**
 * Reverse an IPv4 string: "192.0.2.1" -> "1.2.0.192"
 */
function reverseIpv4(ip: string): string {
	return ip.split(".").reverse().join(".");
}

/**
 * Perform a single DNSBL query with strict timeout
 */
async function querySingleDnsbl(
	reversedIp: string,
	provider: DnsblProvider,
	timeoutMs = 2500,
): Promise<DnsblCheckItemResult> {
	const queryHost = `${reversedIp}.${provider.host}`;
	const start = Date.now();

	try {
		const queryPromise = dns.resolve4(queryHost);
		const timeoutPromise = new Promise<never>((_, reject) =>
			setTimeout(() => reject(new Error("DNS query timeout")), timeoutMs),
		);

		const addresses = await Promise.race([queryPromise, timeoutPromise]);
		const elapsed = Date.now() - start;

		let isListed = Array.isArray(addresses) && addresses.length > 0;

		// HostKarma: 127.0.0.1 is Whitelist (clean), 127.0.0.2 is Blacklist
		if (provider.id === "hostkarma" && addresses) {
			isListed = addresses.some(
				(a) => a === "127.0.0.2" || a === "127.0.0.3" || a === "127.0.0.4",
			);
		}

		// DroneBL: Ignore 127.0.0.1 and 127.0.0.13
		if (provider.id === "dronebl" && addresses) {
			isListed = addresses.some(
				(a) => a !== "127.0.0.1" && a !== "127.0.0.13",
			);
		}

		return {
			id: provider.id,
			name: provider.name,
			host: provider.host,
			category: provider.category,
			isListed,
			responseCodes: addresses || [],
			responseTimeMs: elapsed,
			delistUrl: provider.delistUrl,
			description: provider.description,
		};
	} catch (error) {
		const elapsed = Date.now() - start;
		const code = (error as { code?: string })?.code;
		const message = (error as Error).message;

		// ENOTFOUND / ENODATA / ESERVFAIL means not listed
		const isClean = code === "ENOTFOUND" || code === "ENODATA" || code === "ESERVFAIL";

		return {
			id: provider.id,
			name: provider.name,
			host: provider.host,
			category: provider.category,
			isListed: false,
			responseCodes: [],
			responseTimeMs: elapsed,
			delistUrl: provider.delistUrl,
			description: provider.description,
			error: isClean ? undefined : message,
		};
	}
}

/**
 * Main Controller for Blocklist Check
 */
export async function checkBlocklistController(
	rawInput: string,
): Promise<BlocklistCheckResult> {
	const startTime = Date.now();
	const cleaned = (rawInput || "")
		.trim()
		.toLowerCase()
		.replace(/^https?:\/\//i, "")
		.replace(/\/.*$/, "");

	if (!cleaned) {
		throw new Error("Domain or IP address is required.");
	}

	let inputType: "domain" | "ip" = "domain";
	let targetIp = cleaned;
	let resolvedHostname: string | null = null;

	if (net.isIPv4(cleaned)) {
		inputType = "ip";
		targetIp = cleaned;
		try {
			const hostnames = await dns.reverse(cleaned);
			if (hostnames.length > 0) {
				resolvedHostname = hostnames[0] ?? null;
			}
		} catch {
			resolvedHostname = null;
		}
	} else {
		inputType = "domain";
		resolvedHostname = cleaned;
		try {
			// First try resolving MX records to check the actual mail server IP
			const mxRecords = await dns.resolveMx(cleaned);
			if (mxRecords && mxRecords.length > 0) {
				mxRecords.sort((a, b) => a.priority - b.priority);
				const primaryMx = mxRecords[0]?.exchange;
				if (primaryMx) {
					const ips = await dns.resolve4(primaryMx);
					if (ips && ips.length > 0 && ips[0]) {
						targetIp = ips[0];
					}
				}
			} else {
				// Fallback to domain A record
				const ips = await dns.resolve4(cleaned);
				if (ips && ips.length > 0 && ips[0]) {
					targetIp = ips[0];
				}
			}
		} catch {
			try {
				const ips = await dns.resolve4(cleaned);
				if (ips && ips.length > 0 && ips[0]) {
					targetIp = ips[0];
				}
			} catch {
				throw new Error(
					`Could not resolve DNS records for "${cleaned}". Please verify the domain or IP address.`,
				);
			}
		}
	}

	const reversed = reverseIpv4(targetIp);

	// Execute all DNSBL checks concurrently
	const results = await Promise.all(
		DNSBL_PROVIDERS.map((provider) => querySingleDnsbl(reversed, provider)),
	);

	const listedCount = results.filter((r) => r.isListed).length;
	const cleanCount = results.length - listedCount;
	const isClean = listedCount === 0;
	const scanDurationMs = Date.now() - startTime;

	const recommendations: string[] = [];
	if (isClean) {
		recommendations.push(
			"Your sending IP and domain are clean across all tested global blocklists.",
		);
		recommendations.push(
			"Maintain strict SPF, DKIM, and DMARC enforcement to preserve reputation.",
		);
	} else {
		recommendations.push(
			`Identified ${listedCount} active listing(s). Visit the official delist links to request removal.`,
		);
		recommendations.push(
			"Investigate recent spam complaint spikes or unauthenticated outbound mail activity.",
		);
	}

	return {
		target: cleaned,
		inputType,
		resolvedIp: targetIp,
		hostname: resolvedHostname,
		isClean,
		totalChecked: results.length,
		listedCount,
		cleanCount,
		scanDurationMs,
		results,
		recommendations,
	};
}
