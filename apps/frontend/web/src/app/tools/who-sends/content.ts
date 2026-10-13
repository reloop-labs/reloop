import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/who-sends";
export const toolTitle =
	"Who Sends Email From This Domain? ESP & Stack Fingerprint";
export const toolDescription =
	"See which email providers are allowed to send as any domain, and who receives its mail. We read public MX, SPF and DKIM records and never send email. Free, no sign-up.";
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
				question:
					"What is the difference between an Inbound Mailbox and an Outbound Sender?",
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

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/who-sends`;

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
  -d '{"domain": "stripe.com"}'`,
	},
	{
		id: "javascript",
		label: "JavaScript",
		code: `// No SDK, no API key: it is a plain POST.
const res = await fetch(
  "${apiEndpoint}",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain: "stripe.com" }),
  },
);

const result = await res.json();`,
	},
	{
		id: "typescript",
		label: "TypeScript",
		code: `// No SDK, no API key: it is a plain POST.
const res = await fetch(
  "${apiEndpoint}",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain: "stripe.com" }),
  },
);

const result = (await res.json()) as CheckResult;`,
	},
	{
		id: "node",
		label: "Node.js",
		code: `// Node 18+ has a global fetch, so no dependencies.
const res = await fetch(
  "${apiEndpoint}",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain: "stripe.com" }),
  },
);

const result = await res.json();`,
	},
	{
		id: "axios",
		label: "Axios",
		code: `import axios from "axios";

const { data } = await axios.post(
  "${apiEndpoint}",
  { domain: "stripe.com" },
);`,
	},
	{
		id: "python",
		label: "Python",
		code: `# pip install requests
import requests

result = requests.post(
    "${apiEndpoint}",
    json={"domain": "stripe.com"},
).json()`,
	},
	{
		id: "go",
		label: "Go",
		code: `body, _ := json.Marshal(map[string]string{
    "domain": "stripe.com",
})

res, err := http.Post(
    "${apiEndpoint}",
    "application/json",
    bytes.NewReader(body),
)`,
	},
	{
		id: "java",
		label: "Java",
		code: `HttpClient client = HttpClient.newHttpClient();
String body = "{\\"domain\\": \\"stripe.com\\"}";

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("${apiEndpoint}"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(
    request, HttpResponse.BodyHandlers.ofString());`,
	},
	{
		id: "csharp",
		label: "C#",
		code: `using var client = new HttpClient();

var response = await client.PostAsJsonAsync(
    "${apiEndpoint}",
    new { domain = "stripe.com" });`,
	},
	{
		id: "php",
		label: "PHP",
		code: `$ch = curl_init("${apiEndpoint}");

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode(["domain" => "stripe.com"]),
    CURLOPT_RETURNTRANSFER => true,
]);

$result = curl_exec($ch);`,
	},
	{
		id: "ruby",
		label: "Ruby",
		code: `require "net/http"
require "json"

uri = URI("${apiEndpoint}")

result = Net::HTTP.post(
  uri,
  { domain: "stripe.com" }.to_json,
  "Content-Type" => "application/json"
)`,
	},
	{
		id: "rust",
		label: "Rust",
		code: `let result: serde_json::Value = reqwest::Client::new()
    .post("${apiEndpoint}")
    .json(&serde_json::json!({ "domain": "stripe.com" }))
    .send()
    .await?
    .json()
    .await?;`,
	},
];

export type ApiBodyArg = {
	name: string;
	type: string;
	required: boolean;
	description: string;
};

export const apiBodyArgs: ApiBodyArg[] = [
	{
		name: "domain",
		type: "string",
		required: true,
		description:
			"Domain or URL to inspect (e.g. stripe.com). We read its public MX, SPF and DKIM records; no email is sent.",
	},
];

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

export type ApiStatusCode = "200" | "400" | "429";

export const apiStatusCodes: ApiStatusCode[] = ["200", "400", "429"];

export const apiResponseSamples: Record<ApiStatusCode, string> = {
	"200": apiResponseSample,
	"400": `{
  "message": "Domain parameter is required.",
  "why": "Identifying authorized senders requires a sending domain name (e.g. stripe.com).",
  "fix": "Provide a root domain or URL to inspect.",
  "link": "https://reloop.sh/tools/who-sends"
}`,
	"429": `{
  "message": "Rate limited",
  "why": "Too many checks from this IP.",
  "fix": "Wait a moment and try again."
}`,
};

export const apiResponseSchemas: Record<ApiStatusCode, string> = {
	"200": `{
  "domain": "string",
  "resolvedAt": "string (ISO date)",
  "responseTimeMs": "number",
  "verdict": "single_stack | split_stack | crowded | send_only | opaque | unpublished | wide_open",
  "headline": "string",
  "summary": "string",
  "disclaimer": "string",
  "inbox": "{ provider: string | null, exchanges: string[] }",
  "senders": "{ vendor: string, role: inbox_and_send | inbox_only | send | dkim_only, confidence: high | medium | low, leftover: boolean, evidence: { type: string, value: string }[] }[]",
  "unnamed": "{ ip4: string[], ip6: string[], includes: string[] }",
  "spf": "{ published: boolean, qualifier: string | null, lookupCount: number, rawRecord: string | null }",
  "nextStep": "{ title: string, body: string, href: string }",
  "subdomainNote": "string | null"
}`,
	"400": `{
  "message": "string",
  "why": "string",
  "fix": "string",
  "link": "string"
}`,
	"429": `{
  "message": "string",
  "why": "string",
  "fix": "string"
}`,
};
