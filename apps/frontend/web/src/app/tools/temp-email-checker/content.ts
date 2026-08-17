import type { FaqItem } from "@reloop/web/components/faq-section";
import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/temp-email-checker";

export const toolTitle = "Temp Email Checker";

export const toolDescription =
	"Check whether an email address comes from a disposable or temporary mailbox provider — before it lands in your database and burns your sender reputation.";

export const toolKeywords = [
	"temp email checker",
	"temporary email checker",
	"disposable email checker",
	"disposable email detector",
	"fake email checker",
	"burner email address",
	"throwaway email domain",
	"email validation",
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
			"The local part and domain are parsed against RFC 5322 shape rules, so malformed input is rejected before anything else runs.",
	},
	{
		icon: "shield-cross",
		tag: "Domain list",
		title: "Disposable domains",
		description:
			"The domain is matched against a large, continuously refreshed catalogue of known throwaway mailbox providers.",
	},
	{
		icon: "route",
		tag: "Wildcards",
		title: "Wildcard patterns",
		description:
			"Providers spin up endless subdomains. Suffix patterns catch the whole family instead of one host at a time.",
	},
	{
		icon: "shield-check",
		tag: "Allowlist",
		title: "Exception list",
		description:
			"Legitimate domains that share infrastructure with throwaway services stay whitelisted, so real customers are never blocked.",
	},
	{
		icon: "user-circle",
		tag: "Role",
		title: "Role addresses",
		description:
			"Shared inboxes like info@, billing@ and support@ are flagged separately — they are real, but they behave differently.",
	},
	{
		icon: "globe",
		tag: "Free mail",
		title: "Free providers",
		description:
			"Consumer mailboxes are called out on their own, so you can treat them differently from throwaway addresses.",
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

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/check`;

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
  "verdict": "disposable",
  "isValidSyntax": true,
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
  }
}`;

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
		title: "Nothing to wait on",
		description:
			"Matching runs in memory against the loaded domain catalogue — no DNS lookup, no SMTP probe, no third-party call behind the scenes.",
	},
];

export const faqGroups: { title: string; items: FaqItem[] }[] = [
	{
		title: "Basics",
		items: [
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
					"Domain matching is exact by nature: a domain is either on the list or it isn't. The lists themselves are community maintained and refreshed continuously, but new providers appear constantly, so treat a clean result as 'not currently known to be disposable' rather than a guarantee.",
			},
			{
				question: "Is a Gmail or Outlook address disposable?",
				answer:
					"No. Consumer mailboxes from Gmail, Outlook, Yahoo and similar providers are free, but they are persistent and real. They are reported as a separate signal so you can apply your own policy to them — many products happily accept them.",
			},
		],
	},
	{
		title: "Privacy & API",
		items: [
			{
				question: "Does this store the addresses I check?",
				answer:
					"No. Addresses are checked and discarded — nothing is written to a database, added to a list, or used for marketing. The tool is free and needs no account.",
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
