import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/deliverability-tester";

export const toolTitle = "Email Deliverability & Spam Score Tester";
export const siteTitle = toolTitle;
export const metaTitle = toolTitle;
export const metaDescription =
	"Send a real email to get an instant 0–10 deliverability score. Comprehensive diagnostics for SPF, DKIM, DMARC alignment, IP DNSBL blacklists, Rspamd spam symbols, and MIME structure.";

export const toolDescription =
	"Send a test email from your ESP, SMTP server, or client to get a complete 0–10 deliverability report. Tests SPF, DKIM, DMARC alignment, reverse DNS, 23+ blocklists, Rspamd spam filters, and link reachability.";

export const toolKeywords = [
	"email deliverability test",
	"mail tester",
	"spam score checker",
	"email spam score",
	"dkim tester",
	"spf dmarc alignment check",
	"email header analyzer",
	"free deliverability tool",
];

export const reasons = [
	{
		icon: "shield-check" as const,
		title: "Full RFC Authentication",
		description:
			"Verifies cryptographic DKIM signatures, SPF return-path authentication, strict DMARC alignment, and forward-confirmed reverse DNS (FCrDNS).",
	},
	{
		icon: "alert-triangle" as const,
		title: "23+ Public DNS Blocklists",
		description:
			"Queries sending IPs on Spamhaus ZEN, Barracuda, and SpamCop, and sender domains on Spamhaus DBL, URIBL, and SURBL.",
	},
	{
		icon: "sliders-horiz-2" as const,
		title: "Rspamd & Content Heuristics",
		description:
			"Extracts live Rspamd spam symbols, score deductions, deceptive trigger keywords, and uppercase formatting penalties.",
	},
	{
		icon: "lock" as const,
		title: "24-Hour Privacy Guarantee",
		description:
			"Test sessions and MIME payloads are automatically deleted after 24 hours. No data is stored long-term or shared publicly.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What does this deliverability tester evaluate?",
		answer:
			"It analyzes technical deliverability: cryptographic DKIM verification, SPF and DMARC alignment, reverse DNS (PTR/FCrDNS), 23+ IP and domain DNSBL blocklists, Rspamd spam scoring and symbols, multipart MIME balance, and link health. It starts at a perfect 10.0 score and applies deductions for every detected issue.",
	},
	{
		question:
			"Is this the same as multi-provider inbox placement (seed list testing)?",
		answer:
			"No. This tool tests technical compliance and server configuration—exactly like mail-tester.com. It does not maintain a farm of seed mailboxes on Gmail, Outlook, or Yahoo to test tab placement (e.g. Primary vs Promotions vs Spam tab).",
	},
	{
		question: "How long is my test email and report stored?",
		answer:
			"All test sessions, MIME messages, and diagnostic reports are strictly ephemeral and are permanently deleted after 24 hours. Your test address is unique to your session and cannot be seen by other users.",
	},
	{
		question: "Why did my score decrease?",
		answer:
			"Deductions occur when authentication fails (missing SPF, broken DKIM, unaligned DMARC), when the sending IP or domain is listed on a blocklist, when spam filter rules trigger high penalties, or when HTML templates contain risky tags (forms, scripts) or missing alt tags.",
	},
	{
		question: "How do I test my newsletter or transactional email?",
		answer:
			"Generate a unique test address on this page, copy it into your ESP (e.g. Reloop, SendGrid, Postmark, Mailchimp) as the recipient, and send your campaign. This page will automatically detect the incoming message within 2–5 seconds.",
	},
	{
		question: "Can I automate deliverability testing via API?",
		answer:
			"Yes. Call POST /api/tools/v1/deliverability-test to get a unique test address and polling token, send your email, and poll GET /api/tools/v1/deliverability-test/:token for the structured JSON report. No API key required.",
	},
];

export const faqGroups = [
	{
		title: "What is analyzed",
		items: faqs.slice(0, 3),
	},
	{
		title: "Troubleshooting & API",
		items: faqs.slice(3, 6),
	},
];

export const apiResponseSample = `{
  "token": "test-8f3b2c1a",
  "address": "test-8f3b2c1a@mail-test.reloop.email",
  "status": "received",
  "report": {
    "score": 9.5,
    "grade": "A+",
    "verdict": "inbox_ready",
    "verdictLabel": "Inbox Ready (Excellent)",
    "summary": "Your email passed major authentication, blacklist, and content checks.",
    "from": { "address": "sender@example.com", "domain": "example.com" },
    "subject": "Your Monthly Report",
    "categories": {
      "signature": {
        "id": "signature",
        "title": "Authentication & Identity",
        "mark": 0.0,
        "status": "pass",
        "items": [
          { "id": "auth-spf", "title": "SPF", "mark": 0, "status": "pass" },
          { "id": "auth-dkim", "title": "DKIM", "mark": 0, "status": "pass" },
          { "id": "auth-dmarc", "title": "DMARC", "mark": 0, "status": "pass" }
        ]
      },
      "blacklists": { "id": "blacklists", "mark": 0.0, "status": "pass" },
      "content": { "id": "content", "mark": -0.5, "status": "warn" },
      "body": { "id": "body", "mark": 0.0, "status": "pass" },
      "links": { "id": "links", "mark": 0.0, "status": "pass" }
    }
  }
}`;
