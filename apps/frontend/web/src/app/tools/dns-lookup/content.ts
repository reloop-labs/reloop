export const toolPath = "/tools/dns-lookup";
export const toolTitle = "DNS Lookup & Record Analyzer";
export const toolDescription =
	"Query live DNS records across authoritative nameservers. Inspect A, AAAA, MX, TXT, CNAME, NS, SOA, CAA, and PTR records, detect hosting providers, and check email deliverability health.";
export const metaDescription =
	"Free online DNS lookup tool to check A, AAAA, MX, TXT, CNAME, NS, SOA, CAA, and PTR records. Identify DNS hosting providers and verify SPF/DMARC deliverability.";

export const toolKeywords = [
	"DNS lookup",
	"DNS record checker",
	"MX lookup",
	"A record lookup",
	"TXT record check",
	"nameserver lookup",
	"reverse DNS lookup",
	"PTR lookup",
	"DNS provider detection",
	"SPF lookup",
	"DMARC lookup",
	"SuperTool alternative",
];

export interface DiagnosticReason {
	title: string;
	description: string;
	icon: string;
}

export const reasons: DiagnosticReason[] = [
	{
		title: "Email Deliverability & Spam Prevention",
		description:
			"Mailbox providers like Google and Yahoo require published forward A/AAAA records, active MX routing, and valid SPF/DMARC policies to prevent spam rejection.",
		icon: "shield-check",
	},
	{
		title: "DNS Hosting Provider Detection",
		description:
			"Automatically detects authoritative DNS providers (Cloudflare, AWS Route 53, Google Cloud DNS, GoDaddy) to give tailored record configuration advice.",
		icon: "layout",
	},
	{
		title: "Custom Tracking & Subdomain Health",
		description:
			"Verify CNAME and A record propagation for custom tracking domains, warmup infrastructure, and webhook endpoints with live TTL timings.",
		icon: "sparkles",
	},
	{
		title: "Zero-Setup Developer API",
		description:
			"Programmatically query DNS records via JSON REST endpoints. Perfect for automated domain verification, signup onboarding, and pipeline checks.",
		icon: "terminal",
	},
];

export interface FaqItem {
	question: string;
	answer: string;
}

export interface FaqGroup {
	title: string;
	items: FaqItem[];
}

export const faqGroups: FaqGroup[] = [
	{
		title: "Understanding DNS Records",
		items: [
			{
				question: "What is a DNS Lookup?",
				answer:
					"A DNS (Domain Name System) lookup queries authoritative DNS nameservers to translate human-readable domain names (like reloop.sh) into machine-readable IP addresses (like 104.21.34.29) and locate mail exchanges, aliases, and security records.",
			},
			{
				question: "What record types can I query?",
				answer:
					"Reloop DNS Lookup supports A (IPv4), AAAA (IPv6), MX (Mail Exchange), TXT (SPF/DKIM/verification), CNAME (Canonical Name), NS (Authoritative Name Servers), SOA (Start of Authority), CAA (Certificate Authorities), PTR (Reverse DNS), and SRV (Service) records.",
			},
			{
				question: "How does the prefix syntax work?",
				answer:
					"Similar to SuperTool/MXToolbox, you can prefix your query with a record type such as 'a:domain.com', 'mx:domain.com', 'txt:domain.com', 'dmarc:domain.com', or 'ptr:1.1.1.1' to immediately fetch specific record sets.",
			},
		],
	},
	{
		title: "Email & DNS Best Practices",
		items: [
			{
				question: "Why are A records critical for email sending domains?",
				answer:
					"Spam filters evaluate whether an email's From: domain has a valid forward web presence (A/AAAA records). Senders with empty DNS or missing A records are frequently classified as temporary disposable spam sources.",
			},
			{
				question: "What does DNS TTL mean?",
				answer:
					"TTL (Time to Live) specifies how many seconds recursive DNS resolvers and ISP caches should remember the record before querying authoritative servers again. Lower TTLs (e.g. 300s) speed up record updates, while higher TTLs reduce lookup latency.",
			},
			{
				question: "How does DMARC and SPF tie into DNS?",
				answer:
					"SPF and DMARC are published as TXT records in your DNS zone. SPF lists authorized sending server IPs, while DMARC instructs receivers on how to handle emails that fail cryptographic verification.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiResponseSample = `{
  "query": "stripe.com",
  "domain": "stripe.com",
  "recordType": "ANY",
  "resolvedAt": "2026-08-28T12:00:00.000Z",
  "responseTimeMs": 24,
  "nameserver": "dns1.p01.nsone.net",
  "provider": {
    "id": "ns1",
    "name": "NS1",
    "website": "https://ns1.com",
    "category": "dns",
    "description": "Enterprise DNS and traffic management network."
  },
  "records": [
    {
      "type": "A",
      "name": "stripe.com",
      "value": "199.60.103.30",
      "ttl": 300
    },
    {
      "type": "MX",
      "name": "stripe.com",
      "value": "aspmx.l.google.com",
      "priority": 1,
      "ttl": 300
    },
    {
      "type": "TXT",
      "name": "stripe.com",
      "value": "v=spf1 include:_spf.google.com ~all",
      "ttl": 300
    },
    {
      "type": "TXT",
      "name": "_dmarc.stripe.com",
      "value": "v=DMARC1; p=reject; rua=mailto:dmarc@stripe.com",
      "ttl": 300
    }
  ],
  "diagnostics": [
    {
      "id": "dns-record-published",
      "name": "DNS Record Published",
      "category": "dns",
      "status": "pass",
      "message": "Found 4 published DNS records"
    },
    {
      "id": "dmarc-policy",
      "name": "DMARC Protection",
      "category": "email_auth",
      "status": "pass",
      "message": "DMARC record published with policy p=reject",
      "details": "Domain has strong protection against email spoofing"
    }
  ],
  "summary": {
    "totalRecords": 4,
    "hasA": true,
    "hasAaaa": false,
    "hasMx": true,
    "hasTxt": true,
    "hasCname": false,
    "hasNs": true,
    "hasSoa": false,
    "hasDmarc": true,
    "hasSpf": true,
    "dmarcPolicy": "reject",
    "spfRecord": "v=spf1 include:_spf.google.com ~all"
  }
}`;

