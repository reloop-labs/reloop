import type { FaqItem } from "@reloop/web/components/faq-section";

export const toolPath = "/tools/email-validator";

export const toolTitle = "Free Email Validator & Bulk List Cleaner";
export const siteTitle = toolTitle;
export const metaTitle =
	"Free Email Validator — Bulk Email Verifier & List Cleaner";
export const metaDescription =
	"Free bulk email verifier and email list cleaning tool. Clean email lists, find invalid emails in CSV files, check disposable temporary emails, and verify live DNS MX mail servers instantly.";

export const toolDescription =
	"Free bulk email verifier and list cleaning tool. Validate single addresses or upload CSV files to find invalid emails, detect ~210k+ disposable domains, and verify live DNS MX records.";

export const toolKeywords = [
	"bulk email verifier",
	"clean email list",
	"find invalid emails in csv",
	"check disposable emails",
	"email list cleaning tool",
	"check 5000 email addresses",
	"free email validator",
	"email verifier online",
	"verify email list csv",
	"remove bounce emails",
	"disposable email detector",
	"mx record check",
	"email health checker",
	"email validation api",
	"rfc 5322 syntax validation",
	"emailable alternative",
];

export const reasons = [
	{
		icon: "shield-check" as const,
		title: "RFC 5322 Syntax & Format",
		description:
			"Verifies standard local-part and domain grammar, invalid characters, missing TLDs, and plus-address tags.",
	},
	{
		icon: "alert-triangle" as const,
		title: "210k+ Disposable Domains",
		description:
			"Instantly detects temporary and throwaway inboxes (Mailinator, Yopmail, Temp-Mail, Guerrilla Mail) with zero lag.",
	},
	{
		icon: "sliders" as const,
		title: "Live DNS MX Mail Servers",
		description:
			"Queries public DNS for active mail exchange records, detects unreachable domains and implicit MX fallbacks.",
	},
	{
		icon: "lock" as const,
		title: "Role & Provider Detection",
		description:
			"Differentiates personal mailboxes from shared team aliases (support@, sales@, admin@) and consumer providers.",
	},
];

export const faqs: FaqItem[] = [
	{
		question: "How do I find invalid emails and clean an email list in CSV?",
		answer:
			"To clean an email list, upload your CSV or TXT file into the Bulk Email Verifier tab. The tool automatically detects your email column, deduplicates entries, and validates each address against RFC 5322 syntax, ~210,000 disposable domains, and live DNS MX records. You can then download a sanitized CSV containing only 100% deliverable emails.",
	},
	{
		question:
			"Can I check 5,000 email addresses with this bulk email verifier?",
		answer:
			"Yes. The web interface directly processes lists up to 1,000 emails per batch. For larger lists of 5,000 to 100,000+ addresses, you can split your CSV or use our high-throughput batch API endpoint (POST /api/tools/v1/email-health-check/batch) which evaluates large datasets asynchronously with in-memory domain caching.",
	},
	{
		question: "How does the disposable email checker detect temporary inboxes?",
		answer:
			"The tool checks incoming email domains against an active database of over 210,000 temporary and disposable email providers—including Mailinator, Yopmail, Temp-Mail, 10MinuteMail, and Guerrilla Mail. Throwaway inboxes are flagged with a 0 deliverability score to prevent spam signups.",
	},
	{
		question:
			"Why is an email marked as Undeliverable if the syntax looks valid?",
		answer:
			"An address can have correct syntax (like user@dead-domain.com) but still be undeliverable if the domain does not have active MX mail exchange records answering in DNS or if the domain is listed as a disposable throwaway provider. Messages sent to domains without MX servers will immediately hard bounce.",
	},
	{
		question:
			"How does email list cleaning protect sender reputation and deliverability?",
		answer:
			"Cleaning your email list removes invalid addresses, typos, dead domains, and spam traps before you send campaigns. Maintaining a bounce rate under 1% ensures major inbox providers (Google, Microsoft, Yahoo) route your marketing and transactional messages to the Primary inbox rather than the spam folder.",
	},
	{
		question: "How are duplicate email addresses handled in CSV uploads?",
		answer:
			"Duplicates are automatically identified and consolidated case-insensitively. The tool evaluates only unique addresses to maximize speed and displays a notification banner showing the exact count of duplicates removed from your list.",
	},
	{
		question:
			"Does this email verifier send test emails or ping mailboxes via SMTP?",
		answer:
			"No. It does not send test messages or initiate intrusive SMTP socket handshakes (RCPT TO) that could trigger greylisting, rate limits, or spam trap flags. All checks use secure DNS queries, algorithmic parsing, and in-memory catalogue matching.",
	},
	{
		question: "Can I automate email verification with the API?",
		answer:
			"Yes. You can use our REST API endpoints: POST /api/tools/v1/email-health-check for single-address verification and POST /api/tools/v1/email-health-check/batch for bulk list cleaning. Official SDKs are available for Node.js, Python, Go, PHP, Ruby, Java, .NET, Rust, and cURL.",
	},
];

export const faqGroups = [
	{
		title: "Email Validation & List Cleaning",
		items: faqs.slice(0, 4),
	},
	{
		title: "Deliverability, Limits & API",
		items: faqs.slice(4, 8),
	},
];

export const apiResponseSample = `{
  "input": "alex@reloop.sh",
  "domain": "reloop.sh",
  "verdict": "invalid",
  "isValidSyntax": true,
  "isDisposable": false,
  "isRoleAddress": false,
  "isFreeProvider": false,
  "mxRecords": [],
  "confidence": 0.7,
  "riskScore": 0.38,
  "flags": ["NO_MX_RECORDS"],
  "health": {
    "status": "fail",
    "summary": "Domain does not accept mail (no active MX records).",
    "state": "undeliverable",
    "score": 0,
    "reason": "no_mx_records",
    "user": "alex",
    "domain": "reloop.sh",
    "tag": null,
    "attributes": {
      "free": false,
      "role": false,
      "disposable": false,
      "acceptAll": false,
      "tag": false,
      "numericalCharacters": 0,
      "alphabeticalCharacters": 4,
      "unicodeSymbols": 0,
      "mailboxFull": false,
      "noReply": false,
      "secureEmailGateway": false
    },
    "mailServer": {
      "smtpProvider": null,
      "mxRecord": "reloop.sh",
      "mxRecords": [],
      "implicitMxRecord": true,
      "hasMx": false
    }
  }
}`;
