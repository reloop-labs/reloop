import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/domain-reputation-checker";
export const toolTitle = "Domain Reputation Checker";
export const metaTitle = "Domain Reputation Checker & Sender Health Score";
export const metaDescription =
	"Free overall domain reputation audit. Check sender authentication (SPF, DKIM, DMARC), real-time DNS blocklists, domain maturity, and DNS health with an instant 0–100 score and letter grade.";
export const toolDescription =
	"Check your overall sending domain reputation across authentication, blocklists, domain age, and DNS infrastructure. Get an instant score from 0 to 100 with an A+ to F grade and actionable fixes.";

export const toolKeywords = [
	"domain reputation checker",
	"email domain reputation",
	"sender reputation check",
	"domain health audit",
	"SPF DKIM DMARC check",
	"email deliverability score",
	"domain blocklist checker",
	"check domain sender score",
];

export const reasons = [
	{
		icon: "shield-check",
		title: "Authentication (35%)",
		description:
			"SPF alignment, active DKIM key discovery, and DMARC enforcement policy (reject or quarantine).",
	},
	{
		icon: "ban",
		title: "Real-time Blocklists (30%)",
		description:
			"Independent live DNSBL lookups across Spamhaus DBL, URIBL Multi, SURBL, SEM URIBL, SEM Fresh, and NordSpam.",
	},
	{
		icon: "clock",
		title: "Domain Age & Warmup (20%)",
		description:
			"Direct RDAP registration age audit. Young (<90 days) and brand-new domains face strict mailbox filter throttling.",
	},
	{
		icon: "activity",
		title: "DNS & Infrastructure (15%)",
		description:
			"Verifies MX exchange reachability, IPv4/IPv6 host resolution, redundant nameservers, and TLS/SSL certificate status.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What is domain reputation?",
		answer:
			"Domain reputation is a score that major mailbox providers (like Google, Microsoft, and Yahoo) assign to your sending domain. It determines whether your emails land in the primary inbox, promotions tab, or spam folder.",
	},
	{
		question: "How is the overall reputation score calculated?",
		answer:
			"Our composite score evaluates 4 key pillars: Email Authentication (35%), Live Domain Blocklists (30%), Domain Age and Maturity (20%), and DNS Infrastructure Health (15%). Points are deducted for missing records, relaxed policies, recent registrations, or blocklist listings.",
	},
	{
		question: "Why does domain age matter for reputation?",
		answer:
			"Spammers frequently register fresh domains to blast abusive traffic and abandon them. Because of this, mailbox filters place new domains (<90 days old) in a sandbox with aggressive spam scrutiny until they establish an organic sending history.",
	},
	{
		question: "What should I do if my domain is listed on a blocklist?",
		answer:
			"First, stop all outbound mass mailings and investigate recent bounce spikes or compromised sender credentials. Once the root cause is resolved, submit a delisting request directly to the listing organization.",
	},
	{
		question: "Can I check my domain reputation via API?",
		answer:
			'Yes. Send a POST request to https://reloop.sh/api/tools/v1/domain-reputation with JSON {"domain":"example.com"}, or use HTTP GET with ?domain=example.com. No API key required.',
	},
];

export const faqGroups = [{ title: "Domain Reputation", items: faqs }];

export const apiResponseSample = `{
  "domain": "reloop.sh",
  "resolvedAt": "2026-09-13T03:45:00.000Z",
  "responseTimeMs": 342,
  "score": 95,
  "grade": "A+",
  "verdict": "excellent",
  "verdictLabel": "Outstanding reputation. Maximum deliverability confidence.",
  "breakdown": {
    "authentication": {
      "score": 100,
      "weight": 35,
      "status": "pass",
      "summary": "SPF pass, DKIM pass, DMARC pass"
    },
    "blocklist": {
      "score": 100,
      "weight": 30,
      "status": "pass",
      "summary": "6/6 domain blocklists clean"
    },
    "domainAge": {
      "score": 80,
      "weight": 20,
      "status": "pass",
      "summary": "240 days old (established)"
    },
    "dnsHealth": {
      "score": 100,
      "weight": 15,
      "status": "pass",
      "summary": "2 MX, 2 NS, SSL active"
    }
  },
  "checks": [
    {
      "id": "auth_spf",
      "category": "authentication",
      "label": "SPF Record",
      "status": "pass",
      "detail": "SPF record configured with softfail (~all). Strong, standard deliverability.",
      "record": "v=spf1 include:_spf.reloop.sh ~all"
    },
    {
      "id": "auth_dmarc",
      "category": "authentication",
      "label": "DMARC Policy",
      "status": "pass",
      "detail": "DMARC policy is set to full reject (p=reject, pct=100). Maximum protection & sender credibility.",
      "record": "v=DMARC1; p=reject; pct=100; rua=mailto:dmarc@reloop.sh"
    },
    {
      "id": "blocklist_domain",
      "category": "blocklist",
      "label": "Domain Blocklists (RBL/URI)",
      "status": "pass",
      "detail": "Clean across all 6 major domain blocklists (Spamhaus DBL, URIBL, SURBL, SEM, NordSpam)."
    }
  ],
  "recommendations": [
    "All domain reputation checks passed. Maintain high sender reputation by monitoring engagement and spam complaint rates below 0.1%."
  ]
}`;
