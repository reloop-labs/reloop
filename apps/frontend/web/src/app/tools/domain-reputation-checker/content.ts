import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/domain-reputation-checker";
export const toolTitle = "Domain Reputation Checker";
export const metaTitle = "Free Domain Reputation Checker & Sender Score";
export const metaDescription =
	"Free domain reputation check, no signup. Check sender authentication (SPF, DKIM, DMARC), real-time DNS blocklists, domain maturity, and DNS health with an instant 0–100 score and letter grade.";
export const toolDescription =
	"Check your domain reputation in seconds. Get a 0–100 score from SPF, DKIM, DMARC, 7 domain blocklists, domain age, and DNS, plus the exact DNS records to fix what's wrong.";

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

export const faqs: FaqItem[] = [
	{
		question: "What is domain reputation?",
		answer:
			"Domain reputation is a score that major mailbox providers (like Google, Microsoft, and Yahoo) assign to your sending domain. It determines whether your emails land in the primary inbox, promotions tab, or spam folder.",
	},
	{
		question: "How do I check my domain reputation?",
		answer:
			"Enter your sending domain (for example example.com) in the checker above. In a few seconds you get a 0–100 score and an A+ to F grade, built from SPF, DKIM, and DMARC, seven live domain blocklists, domain age, and DNS health, plus a list of fixes. It's free and needs no signup.",
	},
	{
		question: "What is a good domain reputation score?",
		answer:
			"90 or above (A+) is excellent and 80–89 (A) is strong. 70–79 (B) is good with minor fixes to make. 55–69 (C) means you're exposed to spam filtering or spoofing, and below 55 (D or F) usually means missing authentication records or a blocklist listing.",
	},
	{
		question: "How do I improve my domain reputation?",
		answer:
			"Fix the lowest-scoring pillar first. Publish SPF and DKIM, then move DMARC from p=none to quarantine or reject. If you're on a blocklist, stop the cause and request delisting. Warm up domains younger than 90 days with small, engaged sends, and keep MX, nameservers, and TLS healthy.",
	},
	{
		question: "Is this the same as my Gmail or Google Postmaster reputation?",
		answer:
			"No. Gmail and Microsoft keep their own internal reputation based on how recipients engage with your mail, which you can only see in tools like Google Postmaster Tools. This checker scores the public signals those providers also look at: authentication, blocklists, domain age, and DNS. Fixing these is the foundation for a good mailbox-provider reputation.",
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
		question: "Does it tell me how to fix problems?",
		answer:
			"Yes. Every failing check comes with the exact DNS record to add or change, such as a DMARC record that moves you from p=none to quarantine while keeping your report address. Copy the value into your DNS provider, wait for it to propagate, and run the check again.",
	},
	{
		question:
			"Does my domain meet Gmail, Yahoo, Outlook, and iCloud sender requirements?",
		answer:
			"The Inbox providers tab checks each provider's published DNS rules. Gmail and Yahoo need SPF or DKIM from every sender; iCloud needs SPF, DKIM, and DMARC from everyone; and Gmail, Yahoo, and Outlook need all three once you send 5,000+ messages a day. Alignment, reverse DNS, and unsubscribe headers need a real message, so test those with the free deliverability tester.",
	},
	{
		question: "Can I share my report or show my score?",
		answer:
			"Every report has its own link (for example /tools/domain-reputation-checker?domain=yourdomain.com) that re-runs the check when opened. You can also embed a live badge in a README or website footer. It refreshes daily and links back to your report.",
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
  "score": 95,
  "grade": "A+",
  "verdict": "excellent",
  "breakdown": {
    "authentication": { "score": 100, "weight": 35, "status": "pass" },
    "blocklist": { "score": 100, "weight": 30, "status": "pass" },
    "domainAge": { "score": 80, "weight": 20, "status": "pass" },
    "dnsHealth": { "score": 100, "weight": 15, "status": "pass" }
  },
  "checks": [
    {
      "id": "auth_dmarc",
      "label": "DMARC Policy",
      "status": "pass",
      "record": "v=DMARC1; p=reject; pct=100"
    }
  ],
  "recommendations": []
}`;
