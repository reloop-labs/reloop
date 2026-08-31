export const toolPath = "/tools/spoof-checker";
export const toolTitle = "Can Anyone Spoof My Domain? — Email Spoofing Checker";
export const toolDescription =
	"Find out in plain English if someone can send emails pretending to be you. Check whether Gmail, Yahoo, and Outlook will deliver unauthorized fake emails using your domain.";
export const metaDescription =
	"Free email spoofing vulnerability checker. Test whether attackers can forge email from your domain without permission based on your public SPF, DKIM, and DMARC enforcement records.";

export const toolKeywords = [
	"can anyone spoof my domain",
	"email spoofing checker",
	"domain spoofing test",
	"DMARC p=none test",
	"CEO fraud protection",
	"invoice fraud email test",
	"SPF DMARC spoofer test",
	"email spoofing vulnerability",
	"domain impersonation test",
	"DMARC enforcement checker",
];

export interface DiagnosticReason {
	title: string;
	description: string;
	icon: string;
}

export const reasons: DiagnosticReason[] = [
	{
		title: "Stop Invoice & CEO Fraud",
		description:
			"Attackers forge 'ceo@yourcompany.com' or 'finance@yourcompany.com' to trick employees into wiring money or changing bank accounts.",
		icon: "shield-check",
	},
	{
		title: "The DMARC 'p=none' Blindspot",
		description:
			"Publishing DMARC with 'p=none' collects monitoring reports, but explicitly tells Gmail and Outlook to deliver fake emails anyway.",
		icon: "alert-triangle",
	},
	{
		title: "Protect Brand & Customer Trust",
		description:
			"When your domain is strictly locked, phishing attempts using your exact From address are discarded before reaching your customers.",
		icon: "lock",
	},
	{
		title: "2024+ Inbox Enforcement",
		description:
			"Major mailbox providers reject unaligned sending domains to combat phishing. Secure domains enjoy higher deliverability.",
		icon: "check-circle",
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
		title: "Understanding Email Spoofing",
		items: [
			{
				question: "What does it mean to spoof a domain?",
				answer:
					"Email protocols (SMTP) do not verify sender identity by default. A stranger can configure their mail server to send emails displaying your company's domain in the 'From:' header (e.g. ceo@yourcompany.com) without having access to your email passwords or servers.",
			},
			{
				question: "Why is DMARC 'p=none' still spoofable?",
				answer:
					"'p=none' is a telemetry-only policy. It tells receiving servers: 'Monitor authentication failures and send me reports, but deliver the email to the recipient anyway.' Attackers can still spoof your domain until you upgrade to 'p=quarantine' or 'p=reject'.",
			},
			{
				question: "Does having SPF prevent spoofing on its own?",
				answer:
					"No. SPF only checks the Return-Path (envelope sender) address, not the visible 'From:' address that users see in Gmail or Outlook. Only DMARC enforces alignment between SPF, DKIM, and the visible 'From:' address.",
			},
			{
				question: "What is a subdomain hole (sp=none)?",
				answer:
					"If your root domain is set to 'p=reject' but specifies 'sp=none', attackers cannot spoof '@yourdomain.com' but can still easily spoof '@mail.yourdomain.com' or '@billing.yourdomain.com'.",
			},
		],
	},
	{
		title: "Remediation & Protection",
		items: [
			{
				question: "How do I make my domain un-spoofable?",
				answer:
					"1. Ensure all legitimate email providers (Google Workspace, Reloop, etc.) are included in your SPF record and sign with DKIM. 2. Publish a DMARC policy starting at 'p=none' with an aggregate reporting address (rua=). 3. Review reports and upgrade to 'p=quarantine', then permanently enforce 'p=reject; pct=100'.",
			},
			{
				question: "Does this tool send test spoof emails?",
				answer:
					"No. Sending unauthorized emails without permission is unsafe and prohibited. This tool simply inspects your public DNS records across global resolvers to evaluate the exact rules mailbox providers apply when receiving unauthorized messages.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiResponseSample = `{
  "domain": "stripe.com",
  "resolvedAt": "2026-08-31T12:00:00.000Z",
  "responseTimeMs": 42,
  "spoofable": false,
  "verdict": "protected",
  "headline": "No — receivers are told to reject fakes as you@stripe.com",
  "summary": "Your domain enforces strict DMARC ('p=reject') and SPF protection. Major mailbox providers are instructed to discard fraudulent emails.",
  "inboxOutcome": "rejected",
  "dmarc": {
    "published": true,
    "policy": "reject",
    "subdomainPolicy": "reject",
    "percentage": 100,
    "rawRecord": "v=DMARC1; p=reject; rua=mailto:dmarc-reports@stripe.com; pct=100; aspf=s"
  },
  "spf": {
    "published": true,
    "qualifier": "~all",
    "lookupCount": 1,
    "rawRecord": "v=spf1 include:_spf.google.com ~all"
  },
  "dkim": {
    "published": true,
    "selector": "s1",
    "keyLength": 2048
  },
  "mx": {
    "published": true,
    "provider": "Google Workspace"
  },
  "reasons": [
    {
      "id": "dmarc-protected",
      "severity": "success",
      "title": "Strict DMARC Policy ('p=reject')",
      "detail": "Mailbox providers will drop and reject any message pretending to come from your domain that fails authentication."
    },
    {
      "id": "spf-valid",
      "severity": "success",
      "title": "SPF Configured ('~all')",
      "detail": "Legitimate sending servers are specified with 1/10 DNS lookups."
    }
  ],
  "nextStep": {
    "title": "Your domain is protected",
    "body": "Send transactional and marketing emails through Reloop with full SPF, DKIM, and DMARC alignment without weakening your security policy.",
    "href": "/dashboard/signup"
  },
  "subdomainNote": null
}`;
