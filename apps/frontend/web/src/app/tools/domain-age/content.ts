import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/domain-age";
export const toolTitle =
	"Free Domain Age Calculator — Registration Date, Age & Expiry";
export const toolDescription =
	"Find out exactly how old any domain is. Paste a domain to see its registration date, its age in years, months and days, when it expires, and who it's registered with. Free, no sign-up.";
export const metaDescription =
	"Check how old any domain is, free. See the exact registration date, age in years, months and days, expiry date and registrar from official RDAP records. No sign-up required.";

export const toolKeywords = [
	"domain age calculator",
	"free domain age checker",
	"check domain age",
	"how old is this domain",
	"domain registration date lookup",
	"domain creation date",
	"website age checker",
	"domain expiry date checker",
	"domain registrar lookup",
	"RDAP domain lookup",
	"WHOIS domain age",
	"check when domain was registered",
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
		title: "Domain age",
		items: [
			{
				question: "How do I check how old a domain is for free?",
				answer:
					"Paste any domain into the Reloop Domain Age Calculator above. It queries authoritative RDAP endpoints and returns the exact registration date, the domain's age in years, months and days, its expiry date and its registrar. It's completely free and needs no account.",
			},
			{
				question: "How is the domain age calculated?",
				answer:
					"We read the domain's creation event from its registry over RDAP and count the time from that moment to now. The result is shown as years, months and days, and as a total day count in the API.",
			},
			{
				question:
					"What happens if an expired domain was dropped and re-registered?",
				answer:
					"When an old domain drops and is registered by a new owner, the registry resets the creation date. The age you see is the age of the current registration, not the first time the name was ever registered.",
			},
			{
				question: "Does domain age affect email deliverability?",
				answer:
					"Yes. Mailbox providers treat domains registered in the last 14 to 30 days as high-risk senders. To see whether a domain is ready to send and how fast to ramp up, use the free Domain Warmup Checker.",
			},
		],
	},
	{
		title: "RDAP & registries",
		items: [
			{
				question:
					"What is RDAP and how is it different from traditional WHOIS?",
				answer:
					"RDAP (Registration Data Access Protocol) is the modern, standardized JSON replacement for legacy port-43 WHOIS created by ICANN and the IETF. It provides authoritative, machine-readable registration events directly from accredited registries without web scraping.",
			},
			{
				question:
					"Why does my country code TLD (ccTLD) show 'We can't see this domain's age'?",
				answer:
					"Some country-code TLDs never list themselves on rdap.org. Reloop looks up the TLD in IANA’s RDAP bootstrap, then a catalog of national registries (Identity Digital, DENIC, Nominet, AFNIC, Registro.br, and others), then a nic.{tld} guess. .sh, .io, .de, .uk, .fr, .br, and similar names are checked the same way. If a registry still hides the creation date, we report unknown_age rather than calling the domain unregistered.",
			},
			{
				question:
					"I send mail from mail.example.com, so why is the age for example.com?",
				answer:
					"Only the registered domain has a creation date. Subdomains (mail.reloop.sh, www.acme.com) inherit that date.",
			},
			{
				question: "Is the domain age calculator free?",
				answer:
					"Yes. The calculator and its API are free with no sign-up, no API key, no credits and no expiry.",
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/domain-age`;

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
			"Domain or URL to inspect (e.g. stripe.com). Subdomains resolve to their registrable root; IP addresses are rejected.",
	},
];

export const apiResponseSample = `{
  "domain": "stripe.com",
  "registrableDomain": "stripe.com",
  "resolvedAt": "2026-10-12T17:46:45.966Z",
  "responseTimeMs": 211,
  "verdict": "mature",
  "headline": "This domain is 31 years, 1 month old",
  "summary": "Registered 31 years, 1 month ago (11,353 days). Domain age is completely mature and will not impact email deliverability.",
  "disclaimer": "Gmail and Outlook do not publish an exact age threshold. This evaluation provides Reloop’s sending guidance based on newly registered domain filters.",
  "age": {
    "createdAt": "1995-09-12T04:00:00.000Z",
    "ageDays": 11353,
    "expiresAt": "2027-09-11T04:00:00.000Z",
    "updatedAt": "2025-10-01T01:39:51.000Z",
    "source": "rdap"
  },
  "registry": {
    "registrar": "SafeNames Ltd.",
    "status": ["client delete prohibited", "client transfer prohibited", "client update prohibited", "server delete prohibited", "server transfer prohibited", "server update prohibited"],
    "tld": "com"
  },
  "nameservers": {
    "hosts": ["ns-705.awsdns-24.net", "ns-1087.awsdns-07.org", "ns-1882.awsdns-43.co.uk", "ns-423.awsdns-52.com"],
    "provider": "AWS Route 53",
    "kind": "production"
  },
  "emailSetup": {
    "spf": true,
    "dmarc": true,
    "dmarcPolicy": "reject",
    "mx": true
  },
  "nextStep": {
    "title": "Send high-volume email with Reloop",
    "body": "Scale your transactional and marketing emails with Reloop's developer API and SMTP infrastructure.",
    "href": "/dashboard/signup"
  },
  "warnings": []
}`;

export type ApiStatusCode = "200" | "400" | "429";

export const apiStatusCodes: ApiStatusCode[] = ["200", "400", "429"];

export const apiResponseSamples: Record<ApiStatusCode, string> = {
	"200": apiResponseSample,
	"400": `{
  "message": "Domain parameter is required.",
  "why": "Domain age and warmup checks require a registered domain name (e.g. stripe.com).",
  "fix": "Enter a domain or URL to inspect.",
  "link": "https://reloop.sh/tools/domain-age"
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
  "registrableDomain": "string",
  "resolvedAt": "string (ISO date)",
  "responseTimeMs": "number",
  "verdict": "too_new | cold | warming | established | mature | unknown_age | not_registered | held",
  "headline": "string",
  "summary": "string",
  "disclaimer": "string",
  "age": "{ createdAt: string | null, ageDays: number | null, expiresAt: string | null, updatedAt: string | null, source: rdap | none }",
  "registry": "{ registrar: string | null, status: string[], tld: string | null }",
  "nameservers": "{ hosts: string[], provider: string | null, kind: production | registrar_default | parking | unknown }",
  "emailSetup": "{ spf: boolean, dmarc: boolean, dmarcPolicy: string | null, mx: boolean }",
  "nextStep": "{ title: string, body: string, href: string }",
  "warnings": "string[]"
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
