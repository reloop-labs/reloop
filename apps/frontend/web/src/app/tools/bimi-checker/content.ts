import type { FaqItem } from "@reloop/web/components/faq-section";
import { productionSiteUrl } from "@reloop/web/lib/site";

export const toolPath = "/tools/bimi-checker";

export const toolTitle = "Free BIMI Checker";
export const heroHeading = "Free BIMI Checker";
export const metaTitle =
	"Free BIMI Checker: BIMI Record Lookup & Logo Validator";
export const metaDescription =
	"Free BIMI checker. Look up default._bimi for a sending domain. Validate v=BIMI1, the HTTPS SVG logo URL, optional VMC/CMC, and whether DMARC is at enforcement. No signup.";

export const toolDescription =
	"It checks default._bimi, DMARC enforcement, and SVG Tiny PS logo";

export const toolKeywords = [
	"BIMI checker",
	"BIMI record lookup",
	"BIMI SVG Tiny PS",
	"VMC checker",
	"brand indicators for message identification",
	"free BIMI checker",
	"default._bimi lookup",
	"BIMI logo validator",
	"DMARC enforcement check",
];

export const reasons = [
	{
		icon: "lock",
		title: "DMARC first",
		description:
			"BIMI is not a substitute for authentication. Supporting inboxes require p=quarantine or p=reject with pct=100.",
	},
	{
		icon: "globe",
		title: "HTTPS SVG logo",
		description:
			"The l= tag must be an HTTPS URL to an SVG Tiny PS file. Scripts, animation, and remote hrefs fail.",
	},
	{
		icon: "shield-check",
		title: "Optional VMC",
		description:
			"Gmail and some others also want a Verified Mark Certificate in a=. Missing a= is a warning, not always a hard fail.",
	},
	{
		icon: "file-text",
		title: "default._bimi",
		description:
			"The assertion record lives at default._bimi.{domain}. Empty l= is a valid “do not display” assertion.",
	},
];

export const signals: {
	icon: string;
	tag: string;
	title: string;
	description: string;
}[] = [
	{
		icon: "file-text",
		tag: "DNS",
		title: "BIMI TXT",
		description:
			"The assertion record is looked up at default._bimi.{domain}. No record means no logo, no matter what else is ready.",
	},
	{
		icon: "check",
		tag: "Version",
		title: "v=BIMI1",
		description:
			"The record must start with v=BIMI1. A wrong or missing version tag fails the whole assertion.",
	},
	{
		icon: "globe",
		tag: "Logo",
		title: "Logo URL (l=)",
		description:
			"The l= tag must be an HTTPS URL. Empty l= is a valid “do not display” assertion, not a logo.",
	},
	{
		icon: "shield-check",
		tag: "Certificate",
		title: "VMC / CMC (a=)",
		description:
			"The a= tag holds the Verified or Common Mark Certificate URL. Gmail generally requires one; others treat it as a warning.",
	},
	{
		icon: "lock",
		tag: "DMARC",
		title: "DMARC enforcement",
		description:
			"BIMI needs DMARC at p=quarantine or p=reject with pct=100. p=none never shows a logo.",
	},
	{
		icon: "at-sign",
		tag: "SVG",
		title: "SVG Tiny PS",
		description:
			"The logo is fetched over HTTPS and inspected: Tiny PS profile, square, no scripts, no animation, no remote refs.",
	},
];

export const apiEndpoint = `${productionSiteUrl}/api/tools/v1/bimi-check`;

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
  -d '{"domain": "paypal.com"}'`,
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
    body: JSON.stringify({ domain: "paypal.com" }),
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
    body: JSON.stringify({ domain: "paypal.com" }),
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
    body: JSON.stringify({ domain: "paypal.com" }),
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
  { domain: "paypal.com" },
);`,
	},
	{
		id: "python",
		label: "Python",
		code: `# pip install requests
import requests

result = requests.post(
    "${apiEndpoint}",
    json={"domain": "paypal.com"},
).json()`,
	},
	{
		id: "go",
		label: "Go",
		code: `body, _ := json.Marshal(map[string]string{
    "domain": "paypal.com",
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
String body = "{\\"domain\\": \\"paypal.com\\"}";

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
    new { domain = "paypal.com" });`,
	},
	{
		id: "php",
		label: "PHP",
		code: `$ch = curl_init("${apiEndpoint}");

curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => ["Content-Type: application/json"],
    CURLOPT_POSTFIELDS => json_encode(["domain" => "paypal.com"]),
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
  { domain: "paypal.com" }.to_json,
  "Content-Type" => "application/json"
)`,
	},
	{
		id: "rust",
		label: "Rust",
		code: `let result: serde_json::Value = reqwest::Client::new()
    .post("${apiEndpoint}")
    .json(&serde_json::json!({ "domain": "paypal.com" }))
    .send()
    .await?
    .json()
    .await?;`,
	},
];

export const apiResponseSample = `{
  "domain": "paypal.com",
  "queryName": "default._bimi.paypal.com",
  "verdict": "pass",
  "bimiRecord": "v=BIMI1; l=https://www.paypalobjects.com/marketing/ua/logos/paypal-bimi.svg; a=https://www.paypalobjects.com/marketing/ua/certs/paypal-vmc.pem",
  "logoUrl": "https://www.paypalobjects.com/marketing/ua/logos/paypal-bimi.svg",
  "authorityUrl": "https://www.paypalobjects.com/marketing/ua/certs/paypal-vmc.pem",
  "dmarcRecord": "v=DMARC1; p=reject; pct=100; rua=mailto:d@rua.agari.com",
  "dmarcPolicy": "reject",
  "dmarcPct": 100,
  "dmarcEnforced": true,
  "logo": {
    "fetched": true,
    "contentType": "image/svg+xml",
    "tinyPsOk": true,
    "issues": []
  },
  "checks": [
    {
      "id": "bimi-present",
      "label": "BIMI TXT",
      "status": "pass",
      "detail": "Found BIMI record at default._bimi.paypal.com.",
      "record": "v=BIMI1; l=https://www.paypalobjects.com/marketing/ua/logos/paypal-bimi.svg; a=https://www.paypalobjects.com/marketing/ua/certs/paypal-vmc.pem"
    },
    {
      "id": "bimi-version",
      "label": "v=BIMI1",
      "status": "pass",
      "detail": "Version tag is BIMI1."
    },
    {
      "id": "bimi-logo",
      "label": "Logo URL (l=)",
      "status": "pass",
      "detail": "logo URL is HTTPS. https://www.paypalobjects.com/marketing/ua/logos/paypal-bimi.svg"
    },
    {
      "id": "bimi-authority",
      "label": "VMC / CMC (a=)",
      "status": "pass",
      "detail": "authority certificate URL is HTTPS. https://www.paypalobjects.com/marketing/ua/certs/paypal-vmc.pem"
    },
    {
      "id": "dmarc",
      "label": "DMARC enforcement",
      "status": "pass",
      "detail": "DMARC is at enforcement (p=reject, pct=100).",
      "record": "v=DMARC1; p=reject; pct=100; rua=mailto:d@rua.agari.com"
    }
  ],
  "recommendations": []
}`;

export type ApiStatusCode = "200" | "400" | "429";

export const apiStatusCodes: ApiStatusCode[] = ["200", "400", "429"];

export const apiResponseSamples: Record<ApiStatusCode, string> = {
	"200": apiResponseSample,
	"400": `{
  "message": "Invalid request",
  "why": "domain is required",
  "fix": "Send { "domain": "paypal.com" } as JSON."
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
  "queryName": "string",
  "verdict": "pass | warn | fail",
  "bimiRecord": "string | null",
  "logoUrl": "string | null",
  "authorityUrl": "string | null",
  "dmarcRecord": "string | null",
  "dmarcPolicy": "string | null",
  "dmarcPct": "number | null",
  "dmarcEnforced": "boolean",
  "logo": "{ fetched, contentType, tinyPsOk, issues[] }",
  "checks": "{ id, label, status, detail, record?, fix? }[]",
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
			"A sending domain to check (e.g. paypal.com). We trim, lowercase, and strip URL schemes before looking up default._bimi.",
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
			"Final call: pass, warn or fail. Warn means the record exists but something (usually VMC or SVG) needs attention.",
	},
	{
		name: "bimiRecord",
		type: "string | null",
		description:
			"The raw TXT value found at default._bimi.{domain}. Null when no BIMI record exists.",
	},
	{
		name: "logoUrl",
		type: "string | null",
		description:
			"The HTTPS SVG logo from l=. Empty when the record is a valid “do not display” assertion.",
	},
	{
		name: "dmarcEnforced",
		type: "boolean",
		description:
			"True when DMARC is at p=quarantine or p=reject with pct=100 — the BIMI prerequisite.",
	},
	{
		name: "logo",
		type: "object",
		description:
			"Live HTTPS fetch result: content type, SVG Tiny PS verdict, and any script/animation issues.",
	},
	{
		name: "recommendations",
		type: "string[]",
		description:
			"Human-readable fixes in check order. Empty when everything passes.",
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
			"The endpoint is public and unauthenticated. It is rate limited to 60 requests per minute per IP, so keep it to lookup-time checks rather than bulk scanning.",
	},
	{
		icon: "zap",
		tag: "One round trip",
		title: "DNS plus HTTPS",
		description:
			"BIMI and DMARC are DNS TXT lookups with short timeouts. The logo is fetched over HTTPS and inspected — we never store domains or logos.",
	},
	{
		icon: "refresh-cw",
		tag: "Live data",
		title: "No caching tricks",
		description:
			"Every request reads live DNS and re-fetches the logo URL, so a fixed record shows up on the next check.",
	},
	{
		icon: "gift",
		tag: "Free forever",
		title: "Zero limits & 100% Free",
		description:
			"This checker is free. It needs no signup and has no credits or expiry.",
	},
];

export const faqGroups: { title: string; items: FaqItem[] }[] = [
	{
		title: "Basics",
		items: [
			{
				question: "What is BIMI?",
				answer:
					"Brand Indicators for Message Identification lets supporting mailbox providers show your logo next to authenticated mail. It sits on top of DMARC; it does not replace SPF, DKIM, or DMARC. Paste your sending domain into Reloop's free BIMI checker to see the record we find at default._bimi.",
			},
			{
				question: "How do I check my BIMI record?",
				answer:
					"Enter your sending domain (e.g. paypal.com, not a full URL). We look up default._bimi.{domain}, validate v=BIMI1 and the l= logo URL, check a= for a certificate, confirm DMARC is at enforcement, and fetch the SVG to inspect Tiny PS rules. The page explains each check and what to fix.",
			},
			{
				question: "Why does this check DMARC?",
				answer:
					"BIMI requires a DMARC policy of quarantine or reject, applied to 100% of mail (pct=100 or omitted). p=none is not enough for the logo to appear. That is why DMARC enforcement is a hard fail in this checker, not a warning.",
			},
			{
				question: "Where does the BIMI record live?",
				answer:
					"The assertion record is a TXT record at default._bimi.{domain} — for example default._bimi.paypal.com. An empty l= (v=BIMI1; l=;) is a valid assertion that asks receivers not to show a logo.",
			},
		],
	},
	{
		title: "Logo & VMC",
		items: [
			{
				question: "What is SVG Tiny PS?",
				answer:
					"BIMI logos must be SVG Tiny Portable/Secure: version 1.2, baseProfile tiny-ps, square, no scripts, no animation, no external references. We fetch the l= URL over HTTPS and flag content-type, scripting, animation, and remote href issues.",
			},
			{
				question: "Do I need a VMC?",
				answer:
					"A Verified Mark Certificate (or Common Mark Certificate) is published in a=. Gmail generally requires one before it shows the logo. Other providers may show the logo from a valid BIMI record alone, which is why a missing a= is a warning here rather than a fail.",
			},
			{
				question: "Why does my logo preview fail?",
				answer:
					"Usually the l= URL is not publicly reachable over HTTPS, returns the wrong content type, or the SVG breaks Tiny PS rules (scripts, animation, external refs, non-square canvas). The check detail names the exact issue and the fix to apply.",
			},
			{
				question: "What does a warn verdict mean?",
				answer:
					"The BIMI record exists and DMARC passes, but something needs attention — typically a missing VMC or a logo fetch issue. Fail means the logo cannot show: no record, bad version, bad logo URL, or DMARC not at enforcement.",
			},
		],
	},
	{
		title: "Privacy & API",
		items: [
			{
				question:
					"How is this different from Reloop's SPF, DKIM & DMARC checker?",
				answer:
					"The auth checker validates each authentication record in depth. This BIMI checker answers one question: will supporting inboxes show my logo? It combines the BIMI assertion, DMARC enforcement, and live SVG inspection into a single verdict.",
			},
			{
				question: "Does this store the domains I check?",
				answer:
					"Nothing is written to a database or used for marketing. Request logs may include the domain and verdict for rate limiting. The tool is free and needs no account.",
			},
			{
				question: "Can I run this check from my own application?",
				answer:
					'Yes. POST https://reloop.sh/api/tools/v1/bimi-check with JSON {"domain":"paypal.com"} — no API key, rate limited to 60 requests per minute per IP. Reloop is open-source email infrastructure, so you can also self-host the whole stack.',
			},
		],
	},
];

export const faqs: FaqItem[] = faqGroups.flatMap((group) => group.items);
