export const toolPath = "/tools/lookalike-watch";
export const toolTitle = "Lookalike Domain Watch — Phishing Twin & Mail-Ready Scanner";
export const toolDescription =
	"Check whether someone has registered domains that look like yours (e.g. acme-login.com or acme.co) and whether those lookalikes have active mail servers configured to send email.";
export const metaDescription =
	"Free lookalike domain scanner. Detect typosquats, hyphenated login lookalikes, TLD swaps, and homoglyph twins with active MX or SPF email records.";

export const toolKeywords = [
	"lookalike domain checker",
	"phishing domain scanner",
	"typosquatting detector",
	"homoglyph domain test",
	"brand impersonation monitoring",
	"check lookalike domains",
	"domain twin finder",
	"email spoofing vs lookalike",
	"dnstwist alternative",
	"detect phishing domains",
];

export interface TrickCard {
	type: string;
	example: string;
	explanation: string;
	severity: "high" | "medium" | "info";
}

export const trickCards: TrickCard[] = [
	{
		type: "Hyphen / Service Affix",
		example: "acme-login.com or support-acme.com",
		explanation:
			"Attackers add trusted words ('login', 'verify', 'sso', 'support') with hyphens to trick users into trusting a completely separate domain.",
		severity: "high",
	},
	{
		type: "Alternative TLD Swap",
		example: "acme.co, acme.app, or acme.io",
		explanation:
			"Registering your brand name under a different top-level domain. Users rarely inspect the suffix when receiving urgent messages.",
		severity: "high",
	},
	{
		type: "Visual Typo / Omission",
		example: "accme.com or ame.com",
		explanation:
			"Fat-finger typos, dropped letters, or adjacent character swaps that look identical at a quick glance in mobile inboxes.",
		severity: "medium",
	},
	{
		type: "Homoglyphs & Character Tricks",
		example: "acrne.com (rn looks like m) or IDN punycode",
		explanation:
			"Replacing letters with visually indistinguishable latin or cyrillic characters (such as rn for m, or 1 for l).",
		severity: "medium",
	},
];

export interface DefenseStep {
	step: number;
	title: string;
	description: string;
	actionHref?: string;
	actionLabel?: string;
}

export const defenseSteps: DefenseStep[] = [
	{
		step: 1,
		title: "Lock your authentic domain with DMARC p=reject",
		description:
			"Ensure your legitimate domain cannot be spoofed. While DMARC on acme.com cannot stop acme-login.com, it ensures that your authentic emails are cryptographically verified and distinguishable.",
		actionHref: "/tools/spoof-checker",
		actionLabel: "Check DMARC",
	},
	{
		step: 2,
		title: "Audit mail-capable twins as high priority",
		description:
			"Lookalikes with active MX records or SPF configurations can send and receive email right now. These pose an active risk of CEO fraud, invoice scamming, and credential theft.",
	},
	{
		step: 3,
		title: "Register critical defensive variants",
		description:
			"If budget permits, defensively purchase primary alternative TLDs (e.g. yourbrand.co) and common portal prefixes (e.g. yourbrand-login.com). Park them with null SPF ('v=spf1 -all').",
	},
	{
		step: 4,
		title: "Train staff & customers on full domain inspection",
		description:
			"Educate employees to inspect the full root domain before clicking SSO or payment links. Remember: mail.acme.com is a valid subdomain, but acme-login.com is a separate entity.",
	},
	{
		step: 5,
		title: "Send only from Reloop on your verified domain",
		description:
			"Authenticate all transactional and marketing emails via Reloop's developer infrastructure to maintain pristine domain reputation and brand trust.",
		actionHref: "/dashboard/signup",
		actionLabel: "Get Started Free",
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
		title: "Spoofing vs. Lookalike Domains",
		items: [
			{
				question: "What is the difference between domain spoofing and lookalike domains?",
				answer:
					"Domain spoofing is sending an email using your exact domain (e.g. 'ceo@acme.com') without permission — this is blocked by publishing a strict DMARC 'p=reject' policy. Lookalikes are entirely separate domains registered by third parties (e.g. 'support@acme-login.com' or 'billing@acme.co'). DMARC on your real domain does not stop someone from sending from a lookalike domain.",
			},
			{
				question: "Why do lookalikes with MX or SPF records matter so much?",
				answer:
					"A registered lookalike domain that has MX or SPF records published in DNS is fully equipped to send and receive emails. Attackers use these mail-ready domains to conduct spear-phishing, fake invoice scams, and password reset fraud that bypass basic email filters.",
			},
			{
				question: "Is 'mail.acme.com' a lookalike domain?",
				answer:
					"No. 'mail.acme.com' is a legitimate subdomain of your own registered domain ('acme.com'). Lookalikes are separate registered root domains such as 'acme-mail.com', 'acme.co', or 'login-acme.com'.",
			},
			{
				question: "Does a 'No common lookalikes' verdict mean I am 100% safe from phishing?",
				answer:
					"No. This tool runs a bounded scan across top alternative TLDs, common typos, and prefix permutations. Because the number of possible domain variations on the internet is infinite, a clean scan means no common permutations were detected, not that phishing is impossible.",
			},
		],
	},
	{
		title: "Protection & Best Practices",
		items: [
			{
				question: "Can I stop people from registering domains that look like mine?",
				answer:
					"You cannot prevent third parties from registering names unless you proactively buy them first (defensive registration). If an infringing domain actively commits fraud or trademark violation, legal remedies like ICANN UDRP (Uniform Domain-Name Dispute-Resolution Policy) or registrar abuse reports can be filed.",
			},
			{
				question: "Should I buy every possible variation of my domain?",
				answer:
					"No, buying every variation is impossible and cost-prohibitive. It is best practice to defensively hold key corporate TLDs (e.g. .com, .co, .io) and primary brand login variants, and protect all outbound mail on your real domain with Reloop and DMARC enforcement.",
			},
			{
				question: "Does this tool send test emails or attack the lookalike domains?",
				answer:
					"No. We never send test emails, contact domain owners, or perform invasive probing. We only query public DNS records (NS, A, MX, and TXT) across authoritative global root resolvers.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiResponseSample = `{
  "domain": "stripe.com",
  "registrableDomain": "stripe.com",
  "resolvedAt": "2026-09-01T12:00:00.000Z",
  "responseTimeMs": 380,
  "verdict": "mail_twins",
  "headline": "Lookalikes can send mail that looks like you",
  "summary": "3 lookalike domain(s) have active MX or SPF records configured and can send mail. DMARC on stripe.com cannot stop emails sent from these separate domains.",
  "disclaimer": "This is a finite public-DNS scan of common permutations, not every possible lookalike on the internet or proof of an active attack.",
  "scanned": 65,
  "hits": [
    {
      "name": "stripe-login.com",
      "unicodeName": null,
      "trick": "affix",
      "registered": true,
      "mailCapable": true,
      "mx": true,
      "spf": true
    },
    {
      "name": "stripe.co",
      "unicodeName": null,
      "trick": "tld",
      "registered": true,
      "mailCapable": true,
      "mx": true,
      "spf": false
    },
    {
      "name": "stripe.io",
      "unicodeName": null,
      "trick": "tld",
      "registered": true,
      "mailCapable": false,
      "mx": false,
      "spf": false
    }
  ],
  "nextStep": {
    "title": "Enforce DMARC & monitor lookalikes",
    "body": "Enforce p=reject on stripe.com in Reloop so authentic mail is recognizable, and consider defensive registrations for critical service prefixes.",
    "href": "/dashboard/signup"
  }
}`;
