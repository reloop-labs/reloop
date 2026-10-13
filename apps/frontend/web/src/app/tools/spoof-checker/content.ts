import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/spoof-checker";
export const toolTitle = "Can Anyone Spoof My Domain? Email Spoofing Checker";
export const metaTitle = "Free Email Spoofing Test: Can My Domain Be Spoofed?";
export const toolDescription =
	"Find out if someone can send email pretending to be you. We read your public SPF, DKIM and DMARC records and show whether Gmail, Yahoo and Outlook would deliver a fake. Free, no sign-up.";
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
				question: "How do I test if my domain can be spoofed?",
				answer:
					"Enter your domain in the spoofing test above. It reads your public SPF, DKIM, and DMARC records and tells you in plain English whether Gmail, Yahoo, and Outlook would deliver a forged email sent from your domain. Nothing is sent, so it's safe to run on any domain you own.",
			},
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

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/spoof-checker`;

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
			"Domain or URL to check (e.g. stripe.com). We read its public SPF, DKIM and DMARC records; no email is sent.",
	},
];

export const apiResponseSample = `{
  "domain": "stripe.com",
  "resolvedAt": "2026-08-31T12:00:00.000Z",
  "responseTimeMs": 42,
  "spoofable": false,
  "verdict": "protected",
  "headline": "No, receivers are told to reject fakes as you@stripe.com",
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

export type ApiStatusCode = "200" | "400" | "429";

export const apiStatusCodes: ApiStatusCode[] = ["200", "400", "429"];

export const apiResponseSamples: Record<ApiStatusCode, string> = {
	"200": apiResponseSample,
	"400": `{
  "message": "Domain parameter is required.",
  "why": "Checking spoofability requires a valid domain name (e.g. stripe.com).",
  "fix": "Provide a root domain or URL to analyze.",
  "link": "https://reloop.sh/tools/spoof-checker"
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
  "spoofable": "boolean",
  "verdict": "spoofable | partially_protected | protected",
  "headline": "string",
  "summary": "string",
  "inboxOutcome": "delivered | spam | rejected",
  "dmarc": "{ published: boolean, policy: string | null, subdomainPolicy: string | null, percentage: number | null, rawRecord: string | null }",
  "spf": "{ published: boolean, qualifier: string | null, lookupCount: number, rawRecord: string | null }",
  "dkim": "{ published: boolean, selector: string | null, keyLength: number | null }",
  "mx": "{ published: boolean, provider: string | null }",
  "reasons": "{ id: string, severity: critical | warning | info | success, title: string, detail: string }[]",
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
