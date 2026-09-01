export const toolPath = "/tools/domain-age";
export const toolTitle = "Domain Age & Email Warmup Checker — Registration Date & Risk";
export const toolDescription =
	"Check when any domain was registered via official RDAP records. Discover whether domain age or cold-sending filters will cause Gmail and Outlook to route your emails to spam.";
export const metaDescription =
	"Free domain age and email warmup checker. Query authoritative RDAP registration dates, detect newly registered domain (NRD) spam filter risks, and verify SPF/DMARC readiness.";

export const toolKeywords = [
	"domain age checker",
	"email warmup checker",
	"check domain registration date",
	"newly registered domain spam risk",
	"cold domain email deliverability",
	"RDAP domain lookup",
	"domain age for email warmup",
	"Gmail spam new domain filter",
	"check when domain was registered",
	"domain age trust score",
];

export interface DiagnosticReason {
	title: string;
	description: string;
	icon: string;
}

export const reasons: DiagnosticReason[] = [
	{
		title: "Newly Registered Domain (NRD) Filters",
		description:
			"Mailbox filters like Spamhaus and Gmail automatically penalize domains younger than 14–30 days to defend against disposable spam and phishing campaigns.",
		icon: "alert-triangle",
	},
	{
		title: "Authoritative RDAP Verification",
		description:
			"We query direct ICANN Registration Data Access Protocol (RDAP) endpoints rather than rate-limited, scraped WHOIS port 43 data.",
		icon: "shield-check",
	},
	{
		title: "Age vs. Authentication Separation",
		description:
			"An 8-year-old domain can still fail if SPF/DMARC are missing, while a 4-day-old domain will trigger cold-domain filters even with perfect DNS.",
		icon: "lock",
	},
	{
		title: "Domain Parking & Status Detection",
		description:
			"Detect registrar parking pages, clientHold suspensions, and upcoming domain expiration before sending valuable campaign volume.",
		icon: "server",
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
		title: "Domain Age & Email Deliverability",
		items: [
			{
				question: "Why do mailbox providers like Gmail treat new domains as spam?",
				answer:
					"Spammers frequently register brand-new domains, blast hundreds of thousands of unsolicited emails over 48 hours, and abandon them. To protect recipients, mailbox algorithms (and blocklists like Spamhaus NRD) automatically treat domains registered within the last 14 to 30 days as high-risk cold senders.",
			},
			{
				question: "Does perfect SPF, DKIM, and DMARC override a brand-new domain?",
				answer:
					"No. Authentication proves that the sender authorized the email, but it does not give the domain a positive sending reputation history. A 3-day-old domain with valid SPF and DMARC will still face severe inbox filtering if it suddenly sends high-volume marketing emails.",
			},
			{
				question: "How long should I wait before sending marketing or cold emails?",
				answer:
					"We recommend waiting at least 14 days after domain registration before beginning initial sending warmups. During the first 14 days, publish SPF, DKIM, and DMARC in DNS. Start warmups slowly between days 15 and 90, gradually scaling daily volume.",
			},
			{
				question: "What happens if an expired domain was dropped and re-registered?",
				answer:
					"When an old domain drops and is registered by a new owner, the registry resets the creation date. Mailbox providers treat the newly registered owner as a cold domain with no prior positive sending credit. Our RDAP check reflects the latest active registration date.",
			},
		],
	},
	{
		title: "RDAP, Privacy & Nameservers",
		items: [
			{
				question: "What is RDAP and how is it different from traditional WHOIS?",
				answer:
					"RDAP (Registration Data Access Protocol) is the modern, standardized JSON replacement for legacy port-43 WHOIS created by ICANN and the IETF. It provides authoritative, machine-readable registration events directly from accredited registries without web scraping.",
			},
			{
				question: "Why does my country code TLD (ccTLD) show 'We can't see this domain's age'?",
				answer:
					"Some country-code TLDs never list themselves on rdap.org. Reloop looks up the TLD in IANA’s RDAP bootstrap, then a catalog of national registries (Identity Digital, DENIC, Nominet, AFNIC, Registro.br, and others), then a nic.{tld} guess. .sh, .io, .de, .uk, .fr, .br, and similar names are checked the same way. If a registry still hides the creation date, we report unknown_age rather than calling the domain unregistered.",
			},
			{
				question: "I send mail from mail.example.com — why is the age for example.com?",
				answer:
					"Only the registered domain has a creation date. Subdomains (mail.reloop.sh, www.acme.com) inherit that date. Sending volume from a subdomain does not make the name older in RDAP.",
			},
			{
				question: "What does 'Parking Nameservers' mean?",
				answer:
					"If your domain's DNS points to default registrar parking servers (e.g. Sedo, Bodis, or Namecheap parking), receiving mail servers cannot resolve production mail exchanges. Switch your nameservers to a production DNS provider (like Cloudflare, Route 53, or Google Cloud) to send email.",
			},
			{
				question: "How does Reloop help warm up newly registered domains?",
				answer:
					"Reloop provides built-in SPF/DKIM/DMARC setup, gradual volume ramp-up scheduling, and real-time bounce/spam monitoring so you can safely build high sender reputation without triggering mailbox spam filters.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiResponseSample = `{
  "domain": "stripe.com",
  "registrableDomain": "stripe.com",
  "resolvedAt": "2026-08-31T12:00:00.000Z",
  "responseTimeMs": 142,
  "verdict": "mature",
  "headline": "This domain is old enough",
  "summary": "Registered over 15.0 years ago (5,680 days). Domain age is completely mature and will not impact email deliverability.",
  "disclaimer": "Gmail and Outlook do not publish an exact age threshold. This evaluation provides Reloop’s sending guidance based on newly registered domain filters.",
  "age": {
    "createdAt": "2011-02-11T20:29:43.000Z",
    "ageDays": 5680,
    "expiresAt": "2027-02-11T20:29:43.000Z",
    "source": "rdap"
  },
  "registry": {
    "registrar": "MarkMonitor Inc.",
    "status": ["clientTransferProhibited"],
    "tld": "com"
  },
  "nameservers": {
    "hosts": ["dns1.p01.nsone.net", "dns2.p01.nsone.net"],
    "provider": "NS1",
    "kind": "production"
  },
  "emailSetup": {
    "spf": true,
    "dmarc": true,
    "dmarcPolicy": "reject",
    "mx": true
  },
  "nextStep": {
    "title": "Send high-volume email with Reloop",
    "body": "Scale your transactional and marketing emails with Reloop's developer API and SMTP infrastructure.",
    "href": "/dashboard/signup"
  },
  "warnings": []
}`;
