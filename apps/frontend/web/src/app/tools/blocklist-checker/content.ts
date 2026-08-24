import type { FaqItem } from "@reloop/web/components/faq-section";

export const siteTitle = "Email Domain & IP Blocklist Checker — Free DNSBL Lookup";
export const metaTitle = "Email Domain & IP Blocklist Checker | Reloop";
export const metaDescription =
	"Check if your domain or sending IP address is blacklisted on 50+ major anti-spam DNSBL databases (Spamhaus, Barracuda, SpamCop, SORBS). Free real-time deliverability diagnostic.";

export const toolDescription =
	"Query 50+ major global anti-spam DNSBL databases in real-time. Verify whether your sending domain or mail server IP is blacklisted, identify listing reasons, and get direct removal links.";

export const reasons = [
	{
		icon: "shield-check",
		title: "50+ Global DNSBL Networks",
		description:
			"Spamhaus, Barracuda, SpamCop, and SORBS aggregate databases queried concurrently in real-time.",
	},
	{
		icon: "alert-triangle",
		title: "Zero-Latency Delist Links",
		description:
			"Direct links to official removal forms so you can resolve false-positive listings immediately.",
	},
	{
		icon: "mail",
		title: "Automated MX & A Resolution",
		description:
			"Enter a bare domain (e.g. yourcompany.com) and the tool automatically locates your mail server IP.",
	},
	{
		icon: "lock",
		title: "100% Stateless & Private",
		description:
			"Searches are evaluated entirely in memory and discarded. No queries or domains are ever logged.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "What is an email blocklist (DNSBL / RBL)?",
		answer:
			"A DNS-based Blackhole List (DNSBL) or Real-time Blackhole List (RBL) is a public database of IP addresses and domains suspected of sending spam, hosting malware, or running open mail relays. Mail providers like Gmail, Microsoft 365, and Yahoo query these lists during SMTP connections to reject incoming spam.",
	},
	{
		question: "Why did my domain or IP get blacklisted?",
		answer:
			"Common reasons for blocklisting include sudden spikes in email volume, sending to spam traps (unverified email addresses), compromised email accounts sending malware, high spam complaint rates (>0.1%), or missing authentication (SPF, DKIM, and DMARC).",
	},
	{
		question: "How do I get removed from a blocklist?",
		answer:
			"First, fix the root cause (clean your contact list, verify DKIM/SPF, and eliminate spam triggers). Then, visit the official delist URL provided in the diagnostic report and submit a removal request. Most providers delist within 12–48 hours once verified.",
	},
	{
		question: "Which blocklists matter the most for email deliverability?",
		answer:
			"The most impactful lists are Spamhaus (SBL, XBL, PBL), Barracuda BRBL, and SpamCop SCBL. Being listed on Spamhaus or Barracuda can cause immediate 80–100% email delivery failure across major consumer inboxes.",
	},
	{
		question: "Can I check both domain names and IP addresses?",
		answer:
			"Yes. You can enter a domain name (e.g. acme.com) or a raw IPv4 address (e.g. 198.51.100.1). When entering a domain name, the tool automatically queries your MX and A records to test the active sending mail server.",
	},
	{
		question: "Can I automate blocklist monitoring via API?",
		answer:
			"Yes. Reloop exposes the blocklist verification engine as a public HTTP API (`POST https://api.reloop.sh/api/tools/v1/blocklist-check`), allowing engineering teams to run automated health checks in CI/CD and staging environments.",
	},
];

export const faqGroups = [
	{
		title: "Blocklists & Reputation",
		items: faqs.slice(0, 3),
	},
	{
		title: "Remediation & API Integration",
		items: faqs.slice(3, 6),
	},
];

export const apiResponseSample = `{
  "target": "reloop.sh",
  "input_type": "domain",
  "resolved_ip": "76.76.21.21",
  "hostname": "reloop.sh",
  "is_clean": true,
  "total_checked": 20,
  "listed_count": 0,
  "clean_count": 20,
  "scan_duration_ms": 340,
  "results": [
    {
      "id": "spamhaus-zen",
      "name": "Spamhaus ZEN",
      "host": "zen.spamhaus.org",
      "category": "reputation",
      "is_listed": false,
      "response_codes": [],
      "response_time_ms": 85,
      "delist_url": "https://check.spamhaus.org"
    },
    {
      "id": "barracuda",
      "name": "Barracuda BRBL",
      "host": "b.barracudacentral.org",
      "category": "spam",
      "is_listed": false,
      "response_codes": [],
      "response_time_ms": 112,
      "delist_url": "https://www.barracudacentral.org/rbl/removal-request"
    }
  ],
  "recommendations": [
    "Your sending IP and domain are clean across all tested global blocklists.",
    "Maintain strict SPF, DKIM, and DMARC enforcement to preserve reputation."
  ]
}`;
