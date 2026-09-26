import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/domain-age";
export const toolTitle =
	"Domain Age & Email Warmup Checker — Registration Date & Risk";
export const toolDescription =
	"The older your domain, the more it's trusted - did you check yours?";
export const metaDescription =
	"Free domain age and email warmup checker. Query authoritative RDAP registration dates, detect newly registered domain (NRD) spam filter risks, and verify SPF/DMARC readiness.";

export const toolKeywords = [
	"domain age checker",
	"email warmup checker",
	"check domain registration date",
	"newly registered domain spam risk",
	"cold domain email deliverability",
	"RDAP domain lookup",
	"domain age for email warmup",
	"Gmail spam new domain filter",
	"check when domain was registered",
	"domain age trust score",
];

export interface DiagnosticReason {
	title: string;
	description: string;
	icon: string;
}

export const reasons: DiagnosticReason[] = [
	{
		title: "Newly Registered Domain (NRD) Filters",
		description:
			"Mailbox filters like Spamhaus and Gmail automatically penalize domains younger than 14–30 days to defend against disposable spam and phishing campaigns.",
		icon: "alert-triangle",
	},
	{
		title: "Authoritative RDAP Verification",
		description:
			"We query direct ICANN Registration Data Access Protocol (RDAP) endpoints rather than rate-limited, scraped WHOIS port 43 data.",
		icon: "shield-check",
	},
	{
		title: "Age vs. Authentication Separation",
		description:
			"An 8-year-old domain can still fail if SPF/DMARC are missing, while a 4-day-old domain will trigger cold-domain filters even with perfect DNS.",
		icon: "lock",
	},
	{
		title: "Domain Parking & Status Detection",
		description:
			"Detect registrar parking pages, clientHold suspensions, and upcoming domain expiration before sending valuable campaign volume.",
		icon: "server",
	},
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
		title: "Domain Age & Email Deliverability",
		items: [
			{
				question:
					"Why do mailbox providers like Gmail treat new domains as spam?",
				answer:
					"Spammers frequently register brand-new domains, blast hundreds of thousands of unsolicited emails over 48 hours, and abandon them. To protect recipients, mailbox algorithms (and blocklists like Spamhaus NRD) automatically treat domains registered within the last 14 to 30 days as high-risk cold senders.",
			},
			{
				question:
					"Does perfect SPF, DKIM, and DMARC override a brand-new domain?",
				answer:
					"No. Authentication proves that the sender authorized the email, but it does not give the domain a positive sending reputation history. A 3-day-old domain with valid SPF and DMARC will still face severe inbox filtering if it suddenly sends high-volume marketing emails.",
			},
			{
				question:
					"How long should I wait before sending marketing or cold emails?",
				answer:
					"We recommend waiting at least 14 days after domain registration before beginning initial sending warmups. During the first 14 days, publish SPF, DKIM, and DMARC in DNS. Start warmups slowly between days 15 and 90, gradually scaling daily volume.",
			},
			{
				question:
					"What happens if an expired domain was dropped and re-registered?",
				answer:
					"When an old domain drops and is registered by a new owner, the registry resets the creation date. Mailbox providers treat the newly registered owner as a cold domain with no prior positive sending credit. Our RDAP check reflects the latest active registration date.",
			},
		],
	},
	{
		title: "RDAP, Privacy & Nameservers",
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
					"I send mail from mail.example.com — why is the age for example.com?",
				answer:
					"Only the registered domain has a creation date. Subdomains (mail.reloop.sh, www.acme.com) inherit that date. Sending volume from a subdomain does not make the name older in RDAP.",
			},
			{
				question: "What does 'Parking Nameservers' mean?",
				answer:
					"If your domain's DNS points to default registrar parking servers (e.g. Sedo, Bodis, or Namecheap parking), receiving mail servers cannot resolve production mail exchanges. Switch your nameservers to a production DNS provider (like Cloudflare, Route 53, or Google Cloud) to send email.",
			},
			{
				question: "How does Reloop help warm up newly registered domains?",
				answer:
					"Reloop provides built-in SPF/DKIM/DMARC setup, gradual volume ramp-up scheduling, and real-time bounce/spam monitoring so you can safely build high sender reputation without triggering mailbox spam filters.",
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
		code: `// No SDK, no API key — it is a plain POST.
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
		code: `// No SDK, no API key — it is a plain POST.
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
		code: `// Node 18+ has a global fetch — no dependencies.
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
  "resolvedAt": "2026-08-31T12:00:00.000Z",
  "responseTimeMs": 142,
  "verdict": "mature",
  "headline": "This domain is 15 years, 6 months, 20 days old",
  "summary": "Registered 15 years, 6 months, 20 days ago (5,680 days). Domain age is completely mature and will not impact email deliverability.",
  "disclaimer": "Gmail and Outlook do not publish an exact age threshold. This evaluation provides Reloop’s sending guidance based on newly registered domain filters.",
  "age": {
    "createdAt": "2011-02-11T20:29:43.000Z",
    "ageDays": 5680,
    "expiresAt": "2027-02-11T20:29:43.000Z",
    "source": "rdap"
  },
  "registry": {
    "registrar": "MarkMonitor Inc.",
    "status": ["clientTransferProhibited"],
    "tld": "com"
  },
  "nameservers": {
    "hosts": ["dns1.p01.nsone.net", "dns2.p01.nsone.net"],
    "provider": "NS1",
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
  "age": "{ createdAt: string | null, ageDays: number | null, expiresAt: string | null, source: rdap | none }",
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
