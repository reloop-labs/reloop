export const toolPath = "/tools/auth-checker";
export const toolTitle = "SPF, DKIM & DMARC Email Authentication Checker";
export const toolDescription =
	"Audit your sending domain's email authentication setup. Verify SPF mechanisms and lookup limits, test DKIM selector cryptographic keys, inspect DMARC policy alignment, and check MX server reachability.";
export const metaDescription =
	"Free online email authentication validator. Check SPF (RFC 7208), DKIM (RFC 6376), and DMARC (RFC 7489) records to prevent email spoofing and ensure inbox deliverability.";

export const toolKeywords = [
	"SPF checker",
	"DKIM validator",
	"DMARC checker",
	"email authentication checker",
	"SPF lookup",
	"DKIM selector test",
	"DMARC policy analyzer",
	"MX record checker",
	"BIMI checker",
	"MTA-STS lookup",
	"email spoofing protection",
	"inbox deliverability test",
];

export interface DiagnosticReason {
	title: string;
	description: string;
	icon: string;
}

export const reasons: DiagnosticReason[] = [
	{
		title: "Meet 2024+ Gmail & Yahoo Requirements",
		description:
			"Google and Yahoo strictly enforce SPF, DKIM, and DMARC for custom domains sending to personal inboxes. Missing or unaligned records lead directly to spam filtering.",
		icon: "shield-check",
	},
	{
		title: "Prevent Phishing & Domain Spoofing",
		description:
			"A strict DMARC policy (p=reject) instructs global recipient mailboxes to discard fraudulent emails pretending to originate from your brand.",
		icon: "lock",
	},
	{
		title: "Eliminate SPF PermErrors",
		description:
			"RFC 7208 imposes a strict 10 DNS lookup limit on SPF records. Exceeding 10 lookups triggers a permanent failure and drops inbox rates.",
		icon: "alert-triangle",
	},
	{
		title: "Verify Cryptographic Signatures",
		description:
			"Ensure your DKIM public key is published with strong 2048-bit RSA encryption and properly matches your sending ESP headers.",
		icon: "key",
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
		title: "Authentication Protocols & Standards",
		items: [
			{
				question: "What are SPF, DKIM, and DMARC?",
				answer:
					"SPF (Sender Policy Framework) lists the IP addresses authorized to send emails for your domain. DKIM (DomainKeys Identified Mail) attaches a cryptographic signature to verify messages weren't modified in transit. DMARC (Domain-based Message Authentication) ties SPF and DKIM together, giving receiving servers instructions on what to do if an email fails authentication.",
			},
			{
				question: "What is the SPF 10 lookup limit?",
				answer:
					"RFC 7208 Section 4.6.4 restricts the number of mechanisms and modifiers that do DNS lookups (such as 'include', 'a', 'mx', 'ptr', 'exists', 'redirect') to at most 10. Exceeding this limit results in an SPF PermError (Permanent Error), which causes receiving servers to treat your email as unauthenticated.",
			},
			{
				question: "How do I find my DKIM selector?",
				answer:
					"Your DKIM selector is provided by your email service provider (e.g. Google Workspace uses 'google', Reloop uses 's1' or 'reloop', SendGrid uses 's1'/'s2', Postmark uses '2023...'). The record is published in your DNS under '<selector>._domainkey.<yourdomain>'.",
			},
			{
				question: "What is the difference between p=none, p=quarantine, and p=reject?",
				answer:
					"p=none is a monitoring policy where unauthorized emails are still delivered to the inbox while sending you diagnostic DMARC reports. p=quarantine moves unauthenticated emails to the Spam/Junk folder. p=reject is the strongest policy that instructs mailbox providers to block and reject unauthorized emails entirely.",
			},
		],
	},
	{
		title: "Deliverability & Troubleshooting",
		items: [
			{
				question: "Why does my domain need an MX record for outbound sending?",
				answer:
					"Major email providers like Gmail, Yahoo, and Outlook verify that sending domains have active MX (Mail Exchange) records. Domains without MX records are heavily penalized by anti-spam filters because legitimate businesses must be able to receive return bounces and replies.",
			},
			{
				question: "What is BIMI and MTA-STS?",
				answer:
					"BIMI (Brand Indicators for Message Identification) allows your official company logo to be shown beside your emails in supported inboxes like Gmail and Apple Mail (requires DMARC p=quarantine or p=reject). MTA-STS enforces encrypted TLS transport between mail servers to prevent man-in-the-middle tampering.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiResponseSample = `{
  "domain": "stripe.com",
  "resolvedAt": "2026-08-30T12:00:00.000Z",
  "responseTimeMs": 48,
  "score": 100,
  "grade": "A+",
  "verdict": "fully_aligned",
  "verdictLabel": "Fully Protected & Aligned",
  "spf": {
    "status": "pass",
    "published": true,
    "rawRecord": "v=spf1 include:_spf.google.com ~all",
    "qualifier": "~all",
    "lookupCount": 1,
    "mechanisms": ["include:_spf.google.com", "~all"],
    "includes": ["_spf.google.com"],
    "ip4": [],
    "ip6": [],
    "warnings": []
  },
  "dkim": {
    "status": "pass",
    "published": true,
    "selector": "s1",
    "rawRecord": "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
    "publicKey": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8...",
    "keyLength": 2048,
    "algorithm": "rsa",
    "testedSelectors": ["s1", "google", "default"],
    "warnings": []
  },
  "dmarc": {
    "status": "pass",
    "published": true,
    "rawRecord": "v=DMARC1; p=reject; rua=mailto:dmarc-reports@stripe.com; pct=100; aspf=s",
    "policy": "reject",
    "subdomainPolicy": "reject",
    "percentage": 100,
    "rua": ["mailto:dmarc-reports@stripe.com"],
    "ruf": [],
    "dkimAlignment": "relaxed (r)",
    "spfAlignment": "strict (s)",
    "warnings": []
  },
  "mx": {
    "status": "pass",
    "published": true,
    "provider": "Google Workspace",
    "records": [
      { "exchange": "aspmx.l.google.com", "priority": 1 },
      { "exchange": "alt1.aspmx.l.google.com", "priority": 5 }
    ],
    "warnings": []
  },
  "bimi": {
    "status": "pass",
    "published": true,
    "rawRecord": "v=BIMI1; l=https://stripe.com/bimi.svg",
    "svgUrl": "https://stripe.com/bimi.svg",
    "vmcUrl": null
  },
  "mtaSts": {
    "status": "pass",
    "published": true,
    "rawRecord": "v=STSv1; id=20240101",
    "mode": "enforce"
  },
  "diagnostics": [
    {
      "id": "dmarc-record",
      "name": "DMARC Policy Enforcement",
      "category": "dmarc",
      "status": "pass",
      "message": "DMARC published with strict policy 'p=reject' and aggregate reporting",
      "details": "v=DMARC1; p=reject; rua=mailto:dmarc-reports@stripe.com"
    },
    {
      "id": "spf-record",
      "name": "Sender Policy Framework (SPF)",
      "category": "spf",
      "status": "pass",
      "message": "SPF published with 1/10 DNS lookups and '~all' qualifier",
      "details": "v=spf1 include:_spf.google.com ~all"
    },
    {
      "id": "dkim-record",
      "name": "DKIM Signature & Key",
      "category": "dkim",
      "status": "pass",
      "message": "Found 2048-bit RSA key for selector 's1'",
      "details": "s1._domainkey.stripe.com"
    },
    {
      "id": "mx-records",
      "name": "Mail Routing (MX)",
      "category": "mx",
      "status": "pass",
      "message": "Configured with 2 mail exchange server(s) via Google Workspace"
    }
  ]
}`;
