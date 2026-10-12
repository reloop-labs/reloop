import type { FaqItem } from "@reloop/web/components/faq-section";
import { productionSiteUrl } from "@reloop/web/lib/site";

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

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/domain-reputation`;

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
  -d '{"domain": "reloop.sh"}'`,
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
    body: JSON.stringify({ domain: "reloop.sh" }),
  },
);

const report = await res.json();`,
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
    body: JSON.stringify({ domain: "reloop.sh" }),
  },
);

const report = (await res.json()) as ReputationReport;`,
	},
	{
		id: "node",
		label: "Node.js",
		code: `// Node 18+ has a global fetch, no dependencies.
const res = await fetch(
  "${apiEndpoint}",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain: "reloop.sh" }),
  },
);

const report = await res.json();`,
	},
	{
		id: "axios",
		label: "Axios",
		code: `import axios from "axios";

const { data: report } = await axios.post(
  "${apiEndpoint}",
  { domain: "reloop.sh" },
);`,
	},
	{
		id: "python",
		label: "Python",
		code: `# pip install requests
import requests

report = requests.post(
    "${apiEndpoint}",
    json={"domain": "reloop.sh"},
).json()`,
	},
	{
		id: "go",
		label: "Go",
		code: `body, _ := json.Marshal(map[string]string{
    "domain": "reloop.sh",
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
String body = "{\\"domain\\": \\"reloop.sh\\"}";

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
    new { domain = "reloop.sh" });`,
	},
	{
		id: "php",
		label: "PHP",
		code: `$ch = curl_init("${apiEndpoint}");

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode(["domain" => "reloop.sh"]),
    CURLOPT_RETURNTRANSFER => true,
]);

$report = curl_exec($ch);`,
	},
	{
		id: "ruby",
		label: "Ruby",
		code: `require "net/http"
require "json"

uri = URI("${apiEndpoint}")

report = Net::HTTP.post(
  uri,
  { domain: "reloop.sh" }.to_json,
  "Content-Type" => "application/json"
)`,
	},
	{
		id: "rust",
		label: "Rust",
		code: `let report: serde_json::Value = reqwest::Client::new()
    .post("${apiEndpoint}")
    .json(&serde_json::json!({ "domain": "reloop.sh" }))
    .send()
    .await?
    .json()
    .await?;`,
	},
];

export const apiResponseSample = `{
  "domain": "reloop.sh",
  "resolvedAt": "2026-10-12T17:23:07.410Z",
  "responseTimeMs": 2487,
  "score": 97,
  "grade": "A+",
  "verdict": "excellent",
  "verdictLabel": "Outstanding reputation. Maximum deliverability confidence.",
  "breakdown": {
    "authentication": {
      "score": 90,
      "weight": 35,
      "status": "pass",
      "summary": "SPF pass, DKIM fail, DMARC pass"
    },
    "blocklist": {
      "score": 100,
      "weight": 30,
      "status": "pass",
      "summary": "7/7 domain blocklists clean"
    },
    "domainAge": {
      "score": 100,
      "weight": 20,
      "status": "pass",
      "summary": "466 days old (mature)"
    },
    "dnsHealth": {
      "score": 100,
      "weight": 15,
      "status": "pass",
      "summary": "2 MX, 2 NS, SSL active"
    }
  },
  "details": {
    "authentication": {
      "spf": {
        "exists": true,
        "record": "v=spf1 ip4:46.62.131.111 include:reloop.sh ~all",
        "qualifier": "~all",
        "status": "pass",
        "detail": "SPF record published with qualifier '~all' (1/10 lookups)."
      },
      "dkim": {
        "detected": false,
        "status": "fail",
        "detail": "No standard DKIM selector detected in DNS."
      },
      "dmarc": {
        "exists": true,
        "record": "v=DMARC1; p=reject;",
        "policy": "reject",
        "pct": 100,
        "status": "pass",
        "detail": "DMARC policy is set to 'reject' (pct=100%)."
      }
    },
    "blocklist": {
      "cleanCount": 7,
      "listedCount": 0,
      "totalChecked": 7,
      "listings": [
        {
          "zone": "dbl.spamhaus.org",
          "name": "Spamhaus DBL",
          "listed": false
        },
        {
          "zone": "multi.uribl.com",
          "name": "URIBL Multi",
          "listed": false
        }
      ]
    },
    "domainAge": {
      "ageDays": 466,
      "createdDate": "2025-07-03T06:17:03.176Z",
      "expiryDate": "2027-07-03T06:17:03.176Z",
      "registrar": "Spaceship, Inc.",
      "tier": "mature",
      "detail": "Registered 1 year, 3 months, 9 days ago (466 days). Domain age is completely mature and will not impact email deliverability."
    },
    "dnsHealth": {
      "mxRecords": [
        {
          "exchange": "inbound.reloop.sh",
          "priority": 10
        },
        {
          "exchange": "reloop.sh",
          "priority": 10
        }
      ],
      "aRecords": [
        "46.62.131.111"
      ],
      "nsRecords": [
        "elijah.ns.cloudflare.com",
        "leanna.ns.cloudflare.com"
      ],
      "hasPtr": true,
      "sslValid": true,
      "sslDaysRemaining": 74,
      "sslIssuer": "Let's Encrypt"
    }
  },
  "checks": [
    {
      "id": "auth_dkim",
      "category": "authentication",
      "label": "DKIM Signature",
      "status": "fail",
      "detail": "No standard DKIM selector detected in DNS."
    },
    {
      "id": "auth_dmarc",
      "category": "authentication",
      "label": "DMARC Policy",
      "status": "pass",
      "detail": "DMARC policy is set to 'reject' (pct=100%).",
      "record": "v=DMARC1; p=reject;"
    }
  ],
  "recommendations": [
    "No aggregate reporting address ('rua=') configured. You will not receive DMARC delivery reports."
  ]
}`;

export type ApiStatusCode = "200" | "400" | "429";

export const apiStatusCodes: ApiStatusCode[] = ["200", "400", "429"];

export const apiResponseSamples: Record<ApiStatusCode, string> = {
	"200": apiResponseSample,
	"400": `{
  "message": "Invalid domain",
  "why": "The value was not a valid domain name.",
  "fix": "Enter a valid root or sending domain like example.com — without protocol or path prefixes."
}`,
	"429": `{
  "message": "Too many requests",
  "why": "This endpoint allows a limited number of checks per window from one IP address.",
  "fix": "Wait a few seconds before retrying."
}`,
};

const categoryResultSchema = "{ score, weight, status, summary }";

export const apiResponseSchemas: Record<ApiStatusCode, string> = {
	"200": `{
  "domain": "string",
  "resolvedAt": "string (ISO 8601)",
  "responseTimeMs": "number",
  "score": "number (0-100)",
  "grade": "A+ | A | B | C | D | F",
  "verdict": "excellent | good | fair | poor | critical",
  "verdictLabel": "string",
  "breakdown": {
    "authentication": "${categoryResultSchema}",
    "blocklist": "${categoryResultSchema}",
    "domainAge": "${categoryResultSchema}",
    "dnsHealth": "${categoryResultSchema}"
  },
  "details": {
    "authentication": "{ spf, dkim, dmarc }",
    "blocklist": "{ cleanCount, listedCount, totalChecked, listings[] }",
    "domainAge": "{ ageDays?, createdDate?, expiryDate?, registrar?, tier, detail }",
    "dnsHealth": "{ mxRecords[], aRecords[], nsRecords[], hasPtr, sslValid, sslDaysRemaining?, sslIssuer? }"
  },
  "checks": "{ id, category, label, status, detail, record? }[]",
  "recommendations": "string[]"
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
		name: "domain",
		type: "string",
		required: true,
		description:
			"The root or sending domain to score (e.g. reloop.sh). Leave out the protocol and path. You can also send it as a query string with GET ?domain=reloop.sh.",
	},
];
