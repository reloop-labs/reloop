export const toolPath = "/tools/who-sends";
export const toolTitle = "Who Sends Email From This Domain? — ESP & Stack Fingerprint";
export const toolDescription =
	"Discover which email service providers (e.g. Google, Amazon SES, SendGrid, Mailchimp) are authorized to send email for any domain, and inspect their inbound mailbox routing.";
export const metaDescription =
	"Free email sender fingerprint tool. Analyze public SPF includes, nested DNS records, and DKIM selectors to identify every third-party ESP authorized to send as any domain.";

export const toolKeywords = [
	"who sends email from this domain",
	"email stack detector",
	"ESP finder",
	"SPF include analyzer",
	"nested SPF unroller",
	"DKIM selector lookup",
	"email provider fingerprint",
	"find company email service",
	"detect SendGrid SES Mailgun",
	"MX mailbox detector",
];

export interface DiagnosticReason {
	title: string;
	description: string;
	icon: string;
}

export const reasons: DiagnosticReason[] = [
	{
		title: "Audit Third-Party ESP Sprawl",
		description:
			"Identify forgotten marketing tools, old transactional providers, and legacy CRM vendors still authorized to send from your domain.",
		icon: "server",
	},
	{
		title: "Prevent SPF 10-Lookup PermErrors",
		description:
			"Every third-party 'include:' eats into your RFC 7208 10-lookup limit. Finding and removing unused providers fixes delivery failures.",
		icon: "alert-triangle",
	},
	{
		title: "Unroll Hidden Nested Includes",
		description:
			"Many domains delegate SPF through 'include:spf.acme.com'. Our engine recursively follows up to depth 2 to reveal true underlying ESPs.",
		icon: "shield-check",
	},
	{
		title: "Inspect Inbound vs. Outbound Separation",
		description:
			"Understand whether a domain runs a unified stack (e.g. Google Workspace) or splits inbox routing from automated sending pipelines.",
		icon: "mail",
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
		title: "How Sender Fingerprinting Works",
		items: [
			{
				question: "How does this tool identify who sends email for a domain?",
				answer:
					"We query the domain's public DNS records across global root resolvers. By parsing the SPF record's 'include:' mechanisms, resolving nested SPF delegations (depth 2), inspecting MX mail server exchanges, and testing known DKIM cryptographic selectors, we map the infrastructure back to known email service providers.",
			},
			{
				question: "Does this show actual email volume or recent sends?",
				answer:
					"No. DNS records represent a permission authorization list, not a real-time sending log. An authorized provider may be actively sending millions of emails per day, or it may be an abandoned trial account from three years ago that was never removed from DNS.",
			},
			{
				question: "What is the difference between an Inbound Mailbox and an Outbound Sender?",
				answer:
					"The MX (Mail Exchange) record defines who receives email (e.g. employee inboxes on Google Workspace or Microsoft 365). Outbound senders (defined in SPF and DKIM) are the third-party platforms authorized to dispatch automated transactional or marketing emails on behalf of that domain (e.g. Amazon SES, SendGrid, Reloop, Mailchimp).",
			},
			{
				question: "What does 'Likely leftover' mean?",
				answer:
					"If a provider (such as Mailchimp or SendGrid) is listed in your SPF record but has no matching active DKIM signature published while other providers on your domain do sign with DKIM, it frequently indicates an old vendor that was replaced and forgotten.",
			},
		],
	},
	{
		title: "SPF Limits & Architecture",
		items: [
			{
				question: "Why is having too many sending services dangerous?",
				answer:
					"RFC 7208 limits SPF evaluations to a maximum of 10 DNS lookups. Having multiple ESP includes (e.g. Google + SES + SendGrid + HubSpot + Zendesk) often exceeds 10 lookups, resulting in an SPF PermError that causes mailbox providers like Gmail and Yahoo to treat all your legitimate mail as unauthenticated.",
			},
			{
				question: "What does 'Nested SPF unrolling' mean?",
				answer:
					"Companies frequently use branded include domains (like 'include:spf.acme.com' or 'include:mail.acme.com') to hide or organize their records. Our analyzer queries those intermediate records to discover the actual underlying service (e.g. 'spf.acme.com → sendgrid.net').",
			},
			{
				question: "What does 'Opaque / IP-only' sending mean?",
				answer:
					"Some organizations list raw IP addresses (e.g. 'ip4:203.0.113.0/24') in their SPF record instead of named provider hostnames. This indicates dedicated self-hosted mail servers, custom on-premise appliances, or IP flattening services.",
			},
			{
				question: "How can I consolidate my sending vendors with Reloop?",
				answer:
					"Reloop allows you to replace multiple disparate transactional, broadcast, and notification ESP includes with a single high-performance sending record ('include:reloop.sh') while preserving your team's Google Workspace or Microsoft 365 inboxes.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiResponseSample = `{
  "domain": "stripe.com",
  "resolvedAt": "2026-08-31T12:00:00.000Z",
  "responseTimeMs": 38,
  "verdict": "split_stack",
  "headline": "Google Workspace inbox. Mail is sent via Amazon SES and SendGrid.",
  "summary": "3 providers are authorized to send as stripe.com. Inbound mail routing and outbound delivery operate across separate stacks.",
  "disclaimer": "This is who DNS authorizes, not who sent mail last week. DNS is a permission list, not a volume log.",
  "inbox": {
    "provider": "Google Workspace",
    "exchanges": ["aspmx.l.google.com", "alt1.aspmx.l.google.com"]
  },
  "senders": [
    {
      "vendor": "Google Workspace",
      "role": "inbox_and_send",
      "confidence": "high",
      "leftover": false,
      "evidence": [
        { "type": "spf_include", "value": "_spf.google.com" },
        { "type": "dkim_selector", "value": "google" }
      ]
    },
    {
      "vendor": "Amazon SES",
      "role": "send",
      "confidence": "high",
      "leftover": false,
      "evidence": [
        { "type": "spf_include", "value": "amazonses.com" }
      ]
    }
  ],
  "unnamed": {
    "ip4": [],
    "ip6": [],
    "includes": []
  },
  "spf": {
    "published": true,
    "qualifier": "~all",
    "lookupCount": 2,
    "rawRecord": "v=spf1 include:_spf.google.com include:amazonses.com ~all"
  },
  "nextStep": {
    "title": "Consolidate sending infrastructure with Reloop",
    "body": "Replace multiple sending vendors with Reloop's developer-first SMTP and API platform for 100% inbox placement.",
    "href": "/dashboard/signup"
  },
  "subdomainNote": null
}`;
