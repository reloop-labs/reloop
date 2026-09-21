import type { FaqItem } from "@reloop/web/components/faq-section";
import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/temp-email-checker";

export const toolTitle = "Free Temp Email Checker";
export const heroHeading = "Free Temp Email Checker";
export const metaTitle =
	"Free Temp Email Checker — Disposable Email Detector";
export const metaDescription =
	"Free temp email checker and disposable email detector. Instantly detect throwaway inboxes (Mailinator, Yopmail, Temp-Mail), role addresses, and MX records — no signup, no SMTP probing.";

export const toolDescription =
	"Free temp email checker for disposable and throwaway addresses. Check syntax, ~210k known disposable providers, role prefixes, and MX records — we never probe the mailbox.";

export const toolKeywords = [
	"temp email checker",
	"temporary email checker",
	"disposable email checker",
	"disposable email detector",
	"free temp email checker",
	"fake email checker",
	"throwaway email checker",
	"burner email detector",
	"block disposable emails",
	"detect temporary email",
	"mailinator checker",
	"yopmail detector",
	"temp mail detector",
	"disposable domain list",
];

export const signals: {
	icon: string;
	tag: string;
	title: string;
	description: string;
}[] = [
	{
		icon: "at-sign",
		tag: "Syntax",
		title: "Address syntax",
		description:
			"The local-part and domain are parsed against RFC 5322 shape rules. Malformed input never reaches the catalogue or DNS.",
	},
	{
		icon: "shield-cross",
		tag: "Domain list",
		title: "Disposable domains",
		description:
			"The domain is matched against a vendored catalogue of about 210,000 known throwaway mailbox providers.",
	},
	{
		icon: "route",
		tag: "Wildcards",
		title: "Wildcard suffixes",
		description:
			"Some providers mint endless subdomains. We match on label boundaries (*.temp.example), not a free-form regex.",
	},
	{
		icon: "shield-check",
		tag: "Allowlist",
		title: "Exception list",
		description:
			"A local exception list overrides the upstream catalogue when a real domain is wrongly listed as disposable.",
	},
	{
		icon: "user-circle",
		tag: "Role",
		title: "Role prefixes",
		description:
			"Local-parts like info@, billing@, and support@ are flagged as shared inboxes. They are not treated as disposable.",
	},
	{
		icon: "globe",
		tag: "MX",
		title: "MX records",
		description:
			"We look up MX hosts for the domain. That confirms mail can be routed to the domain, not that the mailbox exists.",
	},
];

export const reasons: {
	icon: string;
	stat: string;
	title: string;
	description: string;
}[] = [
	{
		icon: "clock",
		stat: "Bounces",
		title: "Throwaway inboxes expire",
		description:
			"Most temporary mailboxes are destroyed within an hour. Every send after that is a hard bounce recorded against your domain.",
	},
	{
		icon: "shield",
		stat: "Reputation",
		title: "Mailbox providers keep score",
		description:
			"Sustained bounce rates push your domain toward the spam folder for every recipient, not just the disposable ones.",
	},
	{
		icon: "database",
		stat: "Signal",
		title: "Your metrics stop lying",
		description:
			"Burner signups inflate list size and deflate open rates. Filtering them keeps growth numbers honest.",
	},
	{
		icon: "lock",
		stat: "Abuse",
		title: "Free tiers get farmed",
		description:
			"Unlimited throwaway addresses mean unlimited trial accounts. Blocking them at signup closes the cheapest abuse vector you have.",
	},
];

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/temp-email-checker`;

export type ApiSnippet = {
	id: string;
	label: string;
	code: string;
};

/** Non-empty by construction so the page can always fall back to the first tab. */
export const apiSnippets: [ApiSnippet, ...ApiSnippet[]] = [
	{
		id: "curl",
		label: "cURL",
		code: `curl -X POST ${apiEndpoint} \\
  -H "Content-Type: application/json" \\
  -d '{"email": "you@mailinator.com"}'`,
	},
	{
		id: "node",
		label: "Node.js",
		code: `// No SDK, no API key — it is a plain POST.
const res = await fetch(
  "${apiEndpoint}",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "you@mailinator.com" }),
  },
);

const result = await res.json();`,
	},
	{
		id: "python",
		label: "Python",
		code: `# pip install requests
import requests

result = requests.post(
    "${apiEndpoint}",
    json={"email": "you@mailinator.com"},
).json()`,
	},
	{
		id: "go",
		label: "Go",
		code: `body, _ := json.Marshal(map[string]string{
    "email": "you@mailinator.com",
})

res, err := http.Post(
    "${apiEndpoint}",
    "application/json",
    bytes.NewReader(body),
)`,
	},
];

export const apiResponseSample = `{
  "input": "you@mailinator.com",
  "kind": "email",
  "domain": "mailinator.com",
  "unicodeDomain": null,
  "verdict": "disposable",
  "isValidSyntax": true,
  "syntaxFailure": null,
  "isDisposable": true,
  "disposableMatch": {
    "kind": "exact",
    "domain": "mailinator.com"
  },
  "isAllowlisted": false,
  "isRoleAddress": false,
  "isFreeProvider": false,
  "signals": {
    "syntax": "pass",
    "disposable": "fail",
    "role": "pass",
    "freeProvider": "pass"
  },
  "mxRecords": [
    "spool.mailinator.com"
  ],
  "confidence": 0.99,
  "riskScore": 0.95,
  "flags": [
    "DISPOSABLE_DOMAIN",
    "PUBLIC_INBOX_DETECTED"
  ]
}`;

export type ApiStatusCode = "200" | "400" | "429";

export const apiStatusCodes: ApiStatusCode[] = ["200", "400", "429"];

export const apiResponseSamples: Record<ApiStatusCode, string> = {
	"200": apiResponseSample,
	"400": `{
  "message": "Invalid request",
  "why": "email is required",
  "fix": "Send { "email": "you@mailinator.com" } as JSON."
}`,
	"429": `{
  "message": "Rate limited",
  "why": "Too many checks from this IP.",
  "fix": "Wait a moment and try again."
}`,
};

export const apiResponseSchemas: Record<ApiStatusCode, string> = {
	"200": `{
  "input": "string",
  "kind": "email | domain | null",
  "domain": "string | null",
  "unicodeDomain": "string | null",
  "verdict": "invalid | disposable | risky | deliverable",
  "isValidSyntax": "boolean",
  "syntaxFailure": "string | null",
  "isDisposable": "boolean",
  "disposableMatch": "{ kind, domain, pattern? } | null",
  "isAllowlisted": "boolean",
  "isRoleAddress": "boolean",
  "isFreeProvider": "boolean",
  "signals": "{ syntax, disposable, role, freeProvider }",
  "mxRecords": "string[]",
  "confidence": "number (0-1)",
  "riskScore": "number (0-1)",
  "flags": "string[]"
}`,
	"400": `{
  "message": "string",
  "why?": "string",
  "fix?": "string",
  "link?": "string"
}`,
	"429": `{
  "message": "string",
  "why?": "string",
  "fix?": "string",
  "link?": "string"
}`,
};

export type ApiBodyArg = {
	name: string;
	type: string;
	required?: boolean;
	description: string;
};

export const apiBodyArgs: ApiBodyArg[] = [
	{
		name: "email",
		type: "string",
		required: true,
		description:
			"An email address or a bare domain to check (e.g. you@mailinator.com or mailinator.com). Trimmed and lowercased before validation.",
	},
];

export type ApiReturnField = {
	name: string;
	type: string;
	description: string;
};

export const apiReturnFields: ApiReturnField[] = [
	{
		name: "verdict",
		type: "string",
		description:
			"Final call: invalid, disposable, risky or deliverable. Block disposable at signup.",
	},
	{
		name: "isDisposable",
		type: "boolean",
		description:
			"True when the domain matches the ~210,000-provider disposable catalogue.",
	},
	{
		name: "mxRecords",
		type: "string[]",
		description:
			"MX hosts for the domain, lowest priority first. Empty when DNS did not answer.",
	},
	{
		name: "confidence",
		type: "number",
		description: "How sure the engine is of the verdict, from 0 to 1.",
	},
	{
		name: "riskScore",
		type: "number",
		description:
			"Signup and list-quality risk, from 0 (safe) to 1 (throwaway).",
	},
	{
		name: "flags",
		type: "string[]",
		description: "Machine-readable reasons behind the verdict and scores.",
	},
];

export const apiNotes: {
	icon: string;
	tag: string;
	title: string;
	description: string;
}[] = [
	{
		icon: "lock",
		tag: "Open access",
		title: "No key, no account",
		description:
			"The endpoint is public and unauthenticated. It is rate limited per IP, so keep it to signup-time checks rather than bulk list scrubbing.",
	},
	{
		icon: "zap",
		tag: "One round trip",
		title: "Catalogue plus DNS",
		description:
			"Disposable matching is in-memory. MX is a DNS lookup with a short timeout. We never open an SMTP session, and we do not store addresses.",
	},
	{
		icon: "refresh-cw",
		tag: "Fresh catalogue",
		title: "List refreshed every 2 hours",
		description:
			"The disposable-domain catalogue holds ~210,000 providers and is re-synced every 2 hours, so brand-new throwaway services get caught too.",
	},
	{
		icon: "gift",
		tag: "Free forever",
		title: "Free for life, no catch",
		description:
			"This checker is completely free — no signup, no credits, no expiry. Come back and use it as often as you need, for as long as you need.",
	},
];

export const faqGroups: { title: string; items: FaqItem[] }[] = [
	{
		title: "Basics",
		items: [
			{
				question: "How do I check if an email is temporary or disposable?",
				answer:
					"Paste the address into Reloop's free temp email checker. We parse RFC syntax, match the domain against a ~210,000-provider disposable catalogue (including Mailinator, Yopmail, and Temp-Mail), flag role prefixes, and look up MX records. A disposable verdict means the domain is a known throwaway provider — not that we probed the mailbox.",
			},
			{
				question: "What is a disposable email address?",
				answer:
					"A disposable — or temporary, throwaway, burner — email address is a mailbox created on demand that anyone can read without signing up, and that usually self-destructs within minutes or hours. People use them to get past signup walls without handing over a real address.",
			},
			{
				question: "Why should I block disposable email addresses?",
				answer:
					"Because they stop existing. Once the mailbox expires, every message you send to it hard-bounces, and mailbox providers read sustained bounce rates as a sign that you send to bad lists. That reputation damage applies to your whole domain, not just the throwaway recipients.",
			},
			{
				question: "Should I always block them?",
				answer:
					"Not necessarily. Blocking outright at signup is right for free tiers and trials, where throwaway addresses are used to farm accounts. For newsletters or content downloads, flagging and suppressing later is often enough — some people simply value their privacy.",
			},
		],
	},
	{
		title: "Accuracy",
		items: [
			{
				question: "How accurate is the check?",
				answer:
					"Disposable matching is a list lookup: the domain is on the catalogue or it isn't. We also classify role prefixes and look up MX records. New temp-mail providers appear constantly, so a clear result means 'not currently known to be disposable' — not a guarantee.",
			},
			{
				question: "Does this prove the mailbox exists?",
				answer:
					"No. We never open an SMTP session or check whether the local-part has a mailbox. MX records only show that the domain publishes a mail exchanger.",
			},
			{
				question: "What does a clear verdict mean?",
				answer:
					"The address parsed, the domain is not on the disposable list, and it is not a shared role prefix. If MX records were found, mail can theoretically be routed to that domain. It is not proof of delivery.",
			},
			{
				question: "Is a Gmail or Outlook address disposable?",
				answer:
					"No. Consumer mailboxes from Gmail, Outlook, Yahoo and similar providers are free, but they are persistent. They are flagged as free providers so you can apply your own policy — they are not treated as throwaway.",
			},
		],
	},
	{
		title: "Privacy & API",
		items: [
			{
				question:
					"How is this different from Reloop's free email validator?",
				answer:
					"The temp email checker is focused on disposable and throwaway detection at signup time (single address, public API, no key). The free email validator adds bulk CSV cleaning (up to 1,000), fuller health scoring, and list export for campaign hygiene. Use this tool to block burners at registration; use the email validator when you need to clean an entire list.",
			},
			{
				question: "Does this store the addresses I check?",
				answer:
					"Nothing is written to a database, added to a list, or used for marketing. Request logs may include the domain and verdict, never the mailbox name. The tool is free and needs no account.",
			},
			{
				question: "Can I run this check from my own application?",
				answer:
					"Yes. Reloop is open-source email infrastructure, so you can run the same validation inside your own signup flow, self-host the whole stack, or use the hosted API. Nothing here is locked behind a proprietary service.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);
